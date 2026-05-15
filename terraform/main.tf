terraform {
  required_version = ">= 1.5.0"

  required_providers {
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = ">= 1.14.0"
    }
  }
}

provider "kubectl" {
  config_path = "~/.kube/config"
}

data "kubectl_file_documents" "k8s_manifests" {
  content = join("\n---\n", [
    file("${path.module}/../k8s/postgres-secret.yaml"),
    file("${path.module}/../k8s/postgres-pvc.yaml"),
    file("${path.module}/../k8s/postgres-deployment.yaml"),
    file("${path.module}/../k8s/postgres-service.yaml"),

    file("${path.module}/../k8s/backend-configmap.yaml"),
    file("${path.module}/../k8s/backend-secret.yaml"),
    file("${path.module}/../k8s/backend-deployment.yaml"),
    file("${path.module}/../k8s/backend-service.yaml"),

    file("${path.module}/../k8s/frontend-deployment.yaml"),
    file("${path.module}/../k8s/frontend-service.yaml"),

    file("${path.module}/../k8s/app-ingress.yaml")
  ])
}

resource "kubectl_manifest" "stockflow" {
  for_each  = data.kubectl_file_documents.k8s_manifests.manifests
  yaml_body = each.value
}