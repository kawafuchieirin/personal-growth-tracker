# Roadmaps API Terraform

Roadmaps API用のAWSインフラストラクチャ定義

## リソース

- Lambda Function
- API Gateway (HTTP API)
- IAM Role & Policy

## 使用方法

```bash
# 初期化
terraform init

# プラン確認
terraform plan -var="environment=dev"

# 適用
terraform apply -var="environment=dev"

# 削除
terraform destroy -var="environment=dev"
```

## 変数

| Name | Description | Default |
|------|-------------|---------|
| environment | 環境名 | dev |
| aws_region | AWSリージョン | ap-northeast-1 |
| project_name | プロジェクト名 | personal-growth-tracker |
| lambda_memory | Lambdaメモリサイズ | 256 |
| lambda_timeout | Lambdaタイムアウト(秒) | 30 |
