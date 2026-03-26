variable "aws_region" {
  type        = string
  description = "AWS region for all resources."
  default     = "ap-southeast-2"
}

variable "project_name" {
  type        = string
  description = "Short project name used in resource names and tags."
  default     = "haivens"
}

variable "environment" {
  type        = string
  description = "Environment name (e.g. dev, staging, prod)."
  default     = "dev"
}

variable "vpc_cidr" {
  type        = string
  description = "IPv4 CIDR for the VPC."
  default     = "10.0.0.0/16"
}

variable "db_identifier" {
  type        = string
  description = "RDS instance identifier (lowercase, unique in region)."
  default     = null
}

variable "db_name" {
  type        = string
  description = "Initial PostgreSQL database name."
  default     = "haivens"
}

variable "db_username" {
  type        = string
  description = "Master username for RDS."
  default     = "haivens"
}

variable "db_engine_version" {
  type        = string
  description = "PostgreSQL version for RDS (major, or major.minor as supported in the region)."
  default     = "16"
}

variable "db_instance_class" {
  type        = string
  description = "RDS instance class."
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  type        = number
  description = "Allocated storage in GB."
  default     = 20
}

variable "db_backup_retention_period" {
  type        = number
  description = "Days to retain automated backups."
  default     = 7
}

variable "db_skip_final_snapshot" {
  type        = bool
  description = "If true, no final snapshot when destroying the instance (typical for dev)."
  default     = true
}

variable "db_multi_az" {
  type        = bool
  description = "Enable Multi-AZ for RDS."
  default     = false
}

variable "bastion_ssh_cidr" {
  type        = string
  description = "CIDR allowed to SSH (TCP 22) to the bastion. Use your public IP/32; 0.0.0.0/0 allows any (not recommended)."
  default     = "0.0.0.0/0"
}

variable "bastion_key_name" {
  type        = string
  description = "EC2 key pair name in this region (must exist in EC2). Required for SSH to the bastion."
  default     = null
  nullable    = true
}

variable "ecs_container_port" {
  type        = number
  description = "Container port exposed by the backend API."
  default     = 3000
}

variable "ecs_task_cpu" {
  type        = number
  description = "Fargate task CPU units (e.g. 256, 512, 1024)."
  default     = 512
}

variable "ecs_task_memory" {
  type        = number
  description = "Fargate task memory in MiB (compatible with cpu)."
  default     = 1024
}

variable "ecs_desired_count" {
  type        = number
  description = "Desired number of ECS tasks."
  default     = 1
}

variable "ecs_image_tag" {
  type        = string
  description = "ECR image tag deployed by ECS."
  default     = "latest"
}

variable "ecs_health_check_path" {
  type        = string
  description = "ALB target group health check path."
  default     = "/"
}

variable "ecs_log_retention_days" {
  type        = number
  description = "CloudWatch log retention period for ECS container logs."
  default     = 14
}

variable "ecs_environment" {
  type        = map(string)
  description = "Plain text environment variables injected into the backend container."
  default = {
    NODE_ENV = "production"
    PORT     = "3000"
  }
}

variable "ecs_secret_arns" {
  type        = list(string)
  description = "Additional Secrets Manager ARNs the task execution role may read."
  default     = []
}

variable "ecs_secret_env" {
  type        = map(string)
  description = "Map of container env var name => Secrets Manager ARN/valueFrom reference."
  default     = {}
}

variable "app_secrets_values" {
  type        = map(string)
  description = "Terraform-managed app secrets. Key becomes ECS env var name; value is the secret value."
  default     = {}
  sensitive   = true
}

variable "app_secret_recovery_window_in_days" {
  type        = number
  description = "Secrets Manager recovery window for app secrets (0 = force delete on destroy, 7-30 = recoverable)."
  default     = 7
}

variable "frontend_hosted_zone_id" {
  type        = string
  description = "Route53 hosted zone ID that contains frontend domain names."
  default     = null
  nullable    = true
}

variable "frontend_domain_names" {
  type        = list(string)
  description = "Optional custom domains for the frontend CloudFront distribution (e.g. [\"haivens.com\", \"www.haivens.com\"])."
  default     = []
}

variable "frontend_price_class" {
  type        = string
  description = "CloudFront price class for frontend distribution."
  default     = "PriceClass_100"
}

variable "api_domain_name" {
  type        = string
  description = "Optional custom domain for backend ALB HTTPS endpoint (e.g. api.example.com)."
  default     = null
  nullable    = true
}

variable "api_hosted_zone_id" {
  type        = string
  description = "Route53 hosted zone ID that contains api_domain_name."
  default     = null
  nullable    = true
}
