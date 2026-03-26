resource "aws_secretsmanager_secret" "app" {
  for_each = toset(nonsensitive(keys(var.app_secrets_values)))

  name                    = "${local.name_prefix}/${replace(lower(each.value), "_", "-")}"
  recovery_window_in_days = var.app_secret_recovery_window_in_days

  tags = {
    Name = "${local.name_prefix}-${lower(each.value)}"
  }
}

resource "aws_secretsmanager_secret_version" "app" {
  for_each = toset(nonsensitive(keys(var.app_secrets_values)))

  secret_id     = aws_secretsmanager_secret.app[each.value].id
  secret_string = var.app_secrets_values[each.value]
}
