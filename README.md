# Cron jobs

### Upload MongoDB backup to Google drive
* Create a service account on GCP and enable the `Drive API` 
in the project. Download key for the service account 
(format as shown below).
```json
{
  "type": "service_account",
  "project_id": "<PROJECT-ID>",
  "private_key_id": "<PROJECT-KEY-ID>",
  "private_key": "<PRIVATE-KEY>",
  "client_email": "<CLIENT-EMAIL>",
  "client_id": "<CLIENT-ID>",
  "auth_uri": "<AUTH-URI>",
  "token_uri": "<TOKEN-URI>",
  "auth_provider_x509_cert_url": "<AUTH-PROVIDER-CERT-URL>",
  "client_x509_cert_url": "<CLIENT-CERT-URL"
}

```
Store this in the root of the project as 
`secrets.json`. This file is added to `.gitignore`.


* Create a constants.json file in the root of the 
project. 
```shell
{
  "files": [
    {
      "localPath": "<UNIQUE-FILE-NAME-1>.gz",
      "parentDirId": "<PARENT-DIRECTORY-ID-1>",
      "MONGO_URL": "<MONGO-URL-WITH-OR-WITHOUT-DB-AT-END-1>"
    },
    {
      "localPath": "<UNIQUE-FILE-NAME-2>.gz",
      "parentDirId": "<PARENT-DIRECTORY-ID-2>",
      "MONGO_URL": "<MONGO-URL-WITH-OR-WITHOUT-DB-AT-END-2>"
    }
  ]
}

```
> Parent directory ID is the id of the folder in Google-drive in which, 
> we plan to push the mongo backup. Make sure the service account 
> has access to the directory.
