output "vpc_id" {
  description = "VPC ID."
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs (one per AZ) - ALB / Fargate with public IP."
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs (one per AZ) - RDS, no NAT route."
  value       = aws_subnet.private[*].id
}

output "internet_gateway_id" {
  description = "Internet gateway attached to the VPC."
  value       = aws_internet_gateway.main.id
}

output "ecs_tasks_security_group_id" {
  description = "Security group for ECS tasks - attach to Fargate service; RDS allows this SG on 5432."
  value       = aws_security_group.ecs_tasks.id
}

output "rds_security_group_id" {
  description = "Security group for RDS (ECS to 5432 only)."
  value       = aws_security_group.rds.id
}

output "rds_endpoint" {
  description = "RDS hostname (no port)."
  value       = aws_db_instance.main.address
}

output "rds_port" {
  description = "RDS port."
  value       = aws_db_instance.main.port
}

output "rds_identifier" {
  description = "RDS instance identifier."
  value       = aws_db_instance.main.identifier
}

output "rds_master_user_secret_arn" {
  description = "Secrets Manager secret ARN for the RDS master password (when manage_master_user_password is true)."
  value       = try(aws_db_instance.main.master_user_secret[0].secret_arn, null)
  sensitive   = true
}

output "bastion_public_ip" {
  description = "Public IPv4 of the bastion EC2 instance (SSH after keypair is configured)."
  value       = aws_instance.bastion.public_ip
}

output "bastion_security_group_id" {
  description = "Security group attached to the bastion (SSH + egress)."
  value       = aws_security_group.bastion.id
}

output "ecr_backend_repository_url" {
  description = "ECR registry URL for docker push (no image tag)."
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_backend_repository_arn" {
  description = "ECR repository ARN for IAM policies."
  value       = aws_ecr_repository.backend.arn
}

output "alb_dns_name" {
  description = "Public ALB DNS name for API access."
  value       = aws_lb.api.dns_name
}

output "api_domain_name" {
  description = "Custom API domain name, when configured."
  value       = var.api_domain_name
}

output "api_base_url" {
  description = "Backend API base URL for frontend configuration."
  value       = local.api_custom_domain_enabled ? "https://${var.api_domain_name}/api" : "http://${aws_lb.api.dns_name}/api"
}

output "alb_zone_id" {
  description = "ALB hosted zone id (Route53 alias target)."
  value       = aws_lb.api.zone_id
}

output "alb_security_group_id" {
  description = "Security group attached to the ALB."
  value       = aws_security_group.alb.id
}

output "ecs_cluster_name" {
  description = "ECS cluster name."
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS backend service name."
  value       = aws_ecs_service.backend.name
}

output "app_secret_arns" {
  description = "Terraform-managed app secrets keyed by ECS env var name."
  value       = { for key, secret in aws_secretsmanager_secret.app : key => secret.arn }
  sensitive   = true
}

output "frontend_s3_bucket_name" {
  description = "S3 bucket storing frontend static assets."
  value       = aws_s3_bucket.frontend.bucket
}

output "frontend_cloudfront_distribution_id" {
  description = "CloudFront distribution ID for frontend cache invalidations."
  value       = aws_cloudfront_distribution.frontend.id
}

output "frontend_cloudfront_domain_name" {
  description = "CloudFront domain name for frontend access."
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "frontend_url" {
  description = "Primary frontend URL (custom domain if configured, otherwise CloudFront domain)."
  value       = local.frontend_custom_domain_enabled ? "https://${local.frontend_primary_domain}" : "https://${aws_cloudfront_distribution.frontend.domain_name}"
}
