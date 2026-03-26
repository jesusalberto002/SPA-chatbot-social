locals {
  name_prefix = "${var.project_name}-${var.environment}"

  azs = slice(data.aws_availability_zones.available.names, 0, 2)

  # Public: 10.0.1.0/24, 10.0.2.0/24 - private: 10.0.11.0/24, 10.0.12.0/24
  public_subnet_cidrs  = [for i in range(2) : cidrsubnet(var.vpc_cidr, 8, i + 1)]
  private_subnet_cidrs = [for i in range(2) : cidrsubnet(var.vpc_cidr, 8, i + 11)]

  db_identifier = coalesce(var.db_identifier, "${local.name_prefix}-postgres")
}
