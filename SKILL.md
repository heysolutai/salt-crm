---
name: skill-uazapi
description: "Integração e automação com a UazAPI (WhatsApp API v2.0). Use para: gerenciar instâncias, enviar mensagens, gerenciar grupos, contatos e webhooks via WhatsApp."
---

# Skill UazAPI

Esta skill fornece instruções e referências para interagir com a UazAPI, uma API robusta para automação de WhatsApp.

## Autenticação

A UazAPI utiliza dois tipos de tokens:

- **token**: Usado para endpoints regulares (mensagens, grupos, etc.). Deve ser enviado no header `token`.
- **admintoken**: Usado para endpoints administrativos (gerenciamento de instâncias). Deve ser enviado no header `admintoken`.

## Configuração Base

A URL base para as requisições é: `https://{subdomain}.uazapi.com`

## Fluxos Comuns

### 1. Gerenciamento de Instância
- **Criar Instância**: `POST /instance/init`
- **Listar Instâncias**: `GET /instance/all`
- **Status da Instância**: `GET /instance/status`
- **Conectar (QR Code)**: `GET /instance/connect`

### 2. Envio de Mensagens
- **Texto**: `POST /message/text`
- **Mídia (Imagem/Vídeo/Documento)**: `POST /message/media`
- **Botão**: `POST /message/button`
- **Lista**: `POST /message/list`

### 3. Grupos
- **Criar Grupo**: `POST /group/create`
- **Adicionar Participante**: `POST /group/add`
- **Remover Participante**: `POST /group/remove`

## Referência de Endpoints

Para uma lista completa de todos os 103 endpoints disponíveis, consulte o arquivo de referência:
- `/home/ubuntu/skills/skill-uazapi/references/endpoints_detailed.md`

## Melhores Práticas

- **WhatsApp Business**: É altamente recomendado o uso de contas Business para evitar instabilidades.
- **Webhooks**: Configure webhooks para receber notificações em tempo real sobre mensagens recebidas e mudanças de status.
- **Rate Limiting**: Respeite os limites do servidor para evitar erros 429.
