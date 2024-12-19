import json
import boto3
import base64

s3 = boto3.client('s3')


def lambda_handler(event, context):
    print('Received event:', json.dumps(event, indent=2))
    bucket_name = 'clouds-project-storage'
    folder = 'photos/'

    # Obsługa preflight request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS, PUT, POST",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            "body": "Preflight response"
        }

    # Obsługa zapytań POST
    if event.get('httpMethod') == 'PUT':
        # headers = event.get('headers', {})
        # content_disposition = headers.get('Content-Disposition')
        # print("Otrzymane dane: " + event['body'])
        file_name = event.get('pathParameters', {}).get('proxy', None)

        if not file_name:
            return {
                "statusCode": 400,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, PUT, POST",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
                "body": json.dumps({"error": "No file name provided"})
            }

        if not event.get('body'):
            return {
                "statusCode": 400,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, PUT, POST",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
                "body": json.dumps({"error": "No file content provided"})
            }

        try:
            file_content = base64.b64decode(event['body'])
            # file_content = event['body']

            # # Zapis do S3
            # s3.put_object(
            #     Bucket=bucket_name,
            #     Key=f"photos/{file_name}",
            #     Body=file_content,
            #     ContentType='application/octet-stream'
            # )

            upload_params = {
                "Bucket": bucket_name,
                "Key": f"photos/{file_name}",  # Nazwa pliku w S3
                "Body": file_content,  # Treść pliku
                "ContentType": 'application/octet-stream'  # Typ MIME
            }

            # Zapisanie pliku w S3
            s3.put_object(**upload_params)

            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, PUT, POST",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
                "body": json.dumps({"message": "File uploaded successfully"})
            }
        except Exception as e:
            return {
                "statusCode": 500,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, PUT, POST",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
                "body": json.dumps({"error": str(e)})
            }

    elif event.get('httpMethod') == 'GET':
        print("halo")
        path_params = event.get('pathParameters', {})
        file_name = path_params.get('proxy', None) if path_params else None
        print(file_name)
        if file_name:
            print("Pobieram")
            # Jeśli podano nazwę pliku, pobierz plik z S3
            try:
                response = s3.get_object(Bucket=bucket_name, Key=f"{folder}{file_name}")
                file_content = response['Body'].read()

                # Konwersja pliku na Base64 (jeśli chcesz zwrócić jako base64)
                file_base64 = base64.b64encode(file_content).decode('utf-8')

                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "OPTIONS, PUT, GET",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization",
                        "Content-Type": "application/octet-stream",  # Typ pliku
                        "Content-Disposition": f"attachment; filename={file_name}"
                    },
                    "body": file_base64,
                    "isBase64Encoded": True  # Informujemy, że odpowiedź jest kodowana w base64
                }
            except Exception as e:
                return {
                    "statusCode": 500,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "OPTIONS, PUT, GET",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization",
                    },
                    "body": json.dumps({"error": str(e)})
                }

        print("Po pobraniu")
        try:
            # Pobranie listy plików z S3
            response = s3.list_objects_v2(Bucket=bucket_name, Prefix=folder)

            if 'Contents' not in response:
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "OPTIONS, PUT, GET",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization",
                    },
                    "body": json.dumps({"files": []})  # Brak plików w folderze
                }

            # Wyciąganie nazw plików
            files = [
                obj['Key'].split('/')[-1] for obj in response['Contents']
                if obj['Key'] != folder  # Pomijamy sam folder
            ]

            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, PUT, GET",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
                "body": json.dumps({"files": files})
            }
        except Exception as e:
            print('Error:', str(e))
            return {
                "statusCode": 500,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, PUT, GET",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
                "body": json.dumps({"error": str(e)})
            }
