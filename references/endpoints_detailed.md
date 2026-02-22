# uazapiGO -  WhatsApp API (v2.0) (v1.0.0)

API para gerenciamento de instâncias do WhatsApp e comunicações.

## ⚠️ Recomendação Importante: WhatsApp Business
**É ALTAMENTE RECOMENDADO usar contas do WhatsApp Business** em vez do WhatsApp normal para integração, o WhatsApp normal pode apresentar inconsistências, desconexões, limitações e instabilidades durante o uso com a nossa API.

## Autenticação
- Endpoints regulares requerem um header 'token' com o token da instância
- Endpoints administrativos requerem um header 'admintoken'

## Estados da Instância
As instâncias podem estar nos seguintes estados:
- `disconnected`: Desconectado do WhatsApp
- `connecting`: Em processo de conexão
- `connected`: Conectado e autenticado com sucesso

## Limites de Uso
- O servidor possui um limite máximo de instâncias conectadas
- Quando o limite é atingido, novas tentativas receberão erro 429
- Servidores gratuitos/demo podem ter restrições adicionais de tempo de vida


## Endpoints

### Admininstração

#### `POST /instance/init`

**Descrição:** Criar Instancia

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "name": "minha-instancia",
  "systemName": "apilocal",
  "adminField01": "custom-metadata-1",
  "adminField02": "custom-metadata-2",
  "fingerprintProfile": "chrome",
  "browser": "chrome"
}
```

---

#### `GET /instance/all`

**Descrição:** Listar todas as instâncias

---

#### `POST /instance/updateAdminFields`

**Descrição:** Atualizar campos administrativos

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "id": "inst_123456",
  "adminField01": "clientId_456",
  "adminField02": "integration_xyz"
}
```

---

#### `GET /globalwebhook`

**Descrição:** Ver Webhook Global

---

#### `POST /globalwebhook`

**Descrição:** Configurar Webhook Global

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "url": "https://webhook.cool/global",
  "events": [
    "connection"
  ],
  "excludeMessages": [
    "wasSentByApi"
  ],
  "addUrlEvents": false,
  "addUrlTypesMessages": false
}
```

---

### Ações na mensagem e Buscar

#### `POST /message/download`

**Descrição:** Baixar arquivo de uma mensagem

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "id": "7EB0F01D7244B421048F0706368376E0",
  "return_base64": false,
  "generate_mp3": false,
  "return_link": false,
  "transcribe": false,
  "openai_apikey": "sk-...",
  "download_quoted": false
}
```

---

#### `POST /message/find`

**Descrição:** Buscar mensagens em um chat

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "id": "user123:r3EB0538",
  "chatid": "5511999999999@s.whatsapp.net",
  "track_source": "chatwoot",
  "track_id": "msg_123456789",
  "limit": 20,
  "offset": 0
}
```

---

#### `POST /message/markread`

**Descrição:** Marcar mensagens como lidas

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "id": [
    "string"
  ]
}
```

---

#### `POST /message/react`

**Descrição:** Enviar reação a uma mensagem

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999@s.whatsapp.net",
  "text": "👍",
  "id": "3EB0538DA65A59F6D8A251"
}
```

---

#### `POST /message/delete`

**Descrição:** Apagar Mensagem Para Todos

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "id": "string"
}
```

---

#### `POST /message/edit`

**Descrição:** Edita uma mensagem enviada

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "id": "3A12345678901234567890123456789012",
  "text": "Texto editado da mensagem"
}
```

---

### Bloqueios

#### `POST /chat/block`

**Descrição:** Bloqueia ou desbloqueia contato do WhatsApp

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999",
  "block": true
}
```

---

#### `GET /chat/blocklist`

**Descrição:** Lista contatos bloqueados

---

### Business

#### `POST /business/get/profile`

**Descrição:** Obter o perfil comercial

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "jid": "5511999999999@s.whatsapp.net"
}
```

---

#### `GET /business/get/categories`

**Descrição:** Obter as categorias de negócios

---

#### `POST /business/update/profile`

**Descrição:** Atualizar o perfil comercial

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "description": "Loja de eletrônicos e acessórios",
  "address": "Rua das Flores, 123 - Centro",
  "email": "contato@empresa.com"
}
```

---

#### `POST /business/catalog/list`

**Descrição:** Listar os produtos do catálogo

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "jid": "5511999999999@s.whatsapp.net"
}
```

---

#### `POST /business/catalog/info`

**Descrição:** Obter informações de um produto do catálogo

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "jid": "5511999999999@s.whatsapp.net",
  "id": "string"
}
```

---

#### `POST /business/catalog/delete`

**Descrição:** Deletar um produto do catálogo

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "id": "string"
}
```

---

#### `POST /business/catalog/show`

**Descrição:** Mostrar um produto do catálogo

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "id": "string"
}
```

---

#### `POST /business/catalog/hide`

**Descrição:** Ocultar um produto do catálogo

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "id": "string"
}
```

---

### CRM

#### `POST /instance/updateFieldsMap`

**Descrição:** Atualizar campos personalizados de leads

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "lead_field01": "string",
  "lead_field02": "string",
  "lead_field03": "string",
  "lead_field04": "string",
  "lead_field05": "string",
  "lead_field06": "string",
  "lead_field07": "string",
  "lead_field08": "string",
  "lead_field09": "string",
  "lead_field10": "string",
  "lead_field11": "string",
  "lead_field12": "string",
  "lead_field13": "string",
  "lead_field14": "string",
  "lead_field15": "string",
  "lead_field16": "string",
  "lead_field17": "string",
  "lead_field18": "string",
  "lead_field19": "string",
  "lead_field20": "string"
}
```

---

#### `POST /chat/editLead`

**Descrição:** Edita informações de lead

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "id": "5511999999999@s.whatsapp.net",
  "chatbot_disableUntil": 1735686000,
  "lead_isTicketOpen": true,
  "lead_assignedAttendant_id": "att_123456",
  "lead_kanbanOrder": 1000,
  "lead_tags": [
    "string"
  ],
  "lead_name": "João Silva",
  "lead_fullName": "João Silva Pereira",
  "lead_email": "joao@exemplo.com",
  "lead_personalid": "123.456.789-00",
  "lead_status": "qualificado",
  "lead_notes": "Cliente interessado em plano premium",
  "lead_field01": "string",
  "lead_field02": "string",
  "lead_field03": "string",
  "lead_field04": "string",
  "lead_field05": "string",
  "lead_field06": "string",
  "lead_field07": "string",
  "lead_field08": "string",
  "lead_field09": "string",
  "lead_field10": "string",
  "lead_field11": "string",
  "lead_field12": "string",
  "lead_field13": "string",
  "lead_field14": "string",
  "lead_field15": "string",
  "lead_field16": "string",
  "lead_field17": "string",
  "lead_field18": "string",
  "lead_field19": "string",
  "lead_field20": "string"
}
```

---

### Chamadas

#### `POST /call/make`

**Descrição:** Iniciar chamada de voz

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999"
}
```

---

#### `POST /call/reject`

**Descrição:** Rejeitar chamada recebida

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "string",
  "id": "string"
}
```

---

### Chatbot Configurações

#### `POST /instance/updatechatbotsettings`

**Descrição:** Chatbot Configurações

---

### Chatbot Trigger

#### `POST /trigger/edit`

**Descrição:** Criar, atualizar ou excluir um trigger do chatbot

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "id": "string",
  "delete": false,
  "trigger": {
    "error": "Could not resolve ref: ../schemas/chatbot_trigger.yaml#/ChatbotTrigger"
  }
}
```

---

#### `GET /trigger/list`

**Descrição:** Listar todos os triggers do chatbot

---

### Chats

#### `POST /chat/delete`

**Descrição:** Deleta chat

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999",
  "deleteChatDB": true,
  "deleteMessagesDB": true,
  "deleteChatWhatsApp": true
}
```

---

#### `POST /chat/archive`

**Descrição:** Arquivar/desarquivar chat

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999",
  "archive": true
}
```

---

#### `POST /chat/read`

**Descrição:** Marcar chat como lido/não lido

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999@s.whatsapp.net",
  "read": false
}
```

---

#### `POST /chat/mute`

**Descrição:** Silenciar chat

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999@s.whatsapp.net",
  "muteEndTime": 8
}
```

---

#### `POST /chat/pin`

**Descrição:** Fixar/desafixar chat

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999",
  "pin": true
}
```

---

#### `POST /chat/find`

**Descrição:** Busca chats com filtros

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "operator": "string",
  "sort": "string",
  "limit": 0,
  "offset": 0,
  "wa_fastid": "string",
  "wa_chatid": "string",
  "wa_archived": false,
  "wa_contactName": "string",
  "wa_name": "string",
  "name": "string",
  "wa_isBlocked": false,
  "wa_isGroup": false,
  "wa_isGroup_admin": false,
  "wa_isGroup_announce": false,
  "wa_isGroup_member": false,
  "wa_isPinned": false,
  "wa_label": "string",
  "lead_tags": "string",
  "lead_isTicketOpen": false,
  "lead_assignedAttendant_id": "string",
  "lead_status": "string"
}
```

---

### Configuração do Agente de IA

#### `POST /agent/edit`

**Descrição:** Criar/Editar Agente

---

#### `GET /agent/list`

**Descrição:** Todos os agentes

---

### Conhecimento dos Agentes

#### `POST /knowledge/edit`

**Descrição:** Criar/Editar Conhecimento do Agente

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "id": "string",
  "delete": false,
  "knowledge": {
    "active": false,
    "tittle": "string",
    "content": "string"
  },
  "fileType": "string"
}
```

---

#### `GET /knowledge/list`

**Descrição:** Listar Base de Conhecimento

---

### Contatos

#### `GET /contacts`

**Descrição:** Retorna lista de contatos do WhatsApp

---

#### `POST /contacts/list`

**Descrição:** Listar todos os contatos com paginacao

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "page": 0,
  "pageSize": 0,
  "limit": 0,
  "offset": 0
}
```

---

#### `POST /contact/add`

**Descrição:** Adiciona um contato à agenda

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "phone": "string",
  "name": "João Silva"
}
```

---

#### `POST /contact/remove`

**Descrição:** Remove um contato da agenda

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "phone": "string"
}
```

---

#### `POST /chat/details`

**Descrição:** Obter Detalhes Completos

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999",
  "preview": false
}
```

---

#### `POST /chat/check`

**Descrição:** Verificar Números no WhatsApp

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "numbers": [
    "string"
  ]
}
```

---

### Enviar Mensagem

#### `POST /send/text`

**Descrição:** Enviar mensagem de texto

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999",
  "text": "Olá {{name}}! Como posso ajudar?",
  "linkPreview": true,
  "linkPreviewTitle": "Título Personalizado",
  "linkPreviewDescription": "Descrição personalizada do link",
  "linkPreviewImage": "https://exemplo.com/imagem.jpg",
  "linkPreviewLarge": true,
  "replyid": "3EB0538DA65A59F6D8A251",
  "mentions": "5511999999999,5511888888888",
  "readchat": true,
  "readmessages": true,
  "delay": 1000,
  "forward": true,
  "track_source": "chatwoot",
  "track_id": "msg_123456789",
  "async": false
}
```

---

#### `POST /send/media`

**Descrição:** Enviar mídia (imagem, vídeo, áudio ou documento)

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999",
  "type": "image",
  "file": "https://exemplo.com/imagem.jpg",
  "text": "Veja esta foto!",
  "docName": "relatorio.pdf",
  "thumbnail": "https://exemplo.com/thumb.jpg",
  "mimetype": "application/pdf",
  "replyid": "3EB0538DA65A59F6D8A251",
  "mentions": "5511999999999,5511888888888",
  "readchat": true,
  "readmessages": true,
  "delay": 1000,
  "forward": true,
  "track_source": "chatwoot",
  "track_id": "msg_123456789",
  "async": false
}
```

---

#### `POST /send/contact`

**Descrição:** Enviar cartão de contato (vCard)

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999",
  "fullName": "João Silva",
  "phoneNumber": "5511999999999,5511888888888",
  "organization": "Empresa XYZ",
  "email": "joao@empresa.com",
  "url": "https://empresa.com/joao",
  "replyid": "3EB0538DA65A59F6D8A251",
  "mentions": "5511999999999,5511888888888",
  "readchat": true,
  "readmessages": true,
  "delay": 1000,
  "forward": true,
  "track_source": "chatwoot",
  "track_id": "msg_123456789",
  "async": false
}
```

---

#### `POST /send/location`

**Descrição:** Enviar localização geográfica

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999",
  "name": "MASP",
  "address": "Av. Paulista, 1578 - Bela Vista, São Paulo - SP",
  "latitude": -23.5616,
  "longitude": -46.6562,
  "replyid": "3EB0538DA65A59F6D8A251",
  "mentions": "5511999999999,5511888888888",
  "readchat": true,
  "readmessages": true,
  "delay": 1000,
  "forward": true,
  "track_source": "chatwoot",
  "track_id": "msg_123456789",
  "async": false
}
```

---

#### `POST /message/presence`

**Descrição:** Enviar atualização de presença

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999",
  "presence": "composing",
  "delay": 30000
}
```

---

#### `POST /send/status`

**Descrição:** Enviar Stories (Status)

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "type": "text",
  "text": "Novidades chegando!",
  "background_color": 7,
  "font": 1,
  "file": "https://example.com/video.mp4",
  "thumbnail": "https://example.com/thumb.jpg",
  "mimetype": "video/mp4",
  "replyid": "3EB0538DA65A59F6D8A251",
  "mentions": "5511999999999,5511888888888",
  "readchat": true,
  "readmessages": true,
  "delay": 1000,
  "forward": false,
  "async": false,
  "track_source": "chatwoot",
  "track_id": "msg_123456789"
}
```

---

#### `POST /send/menu`

**Descrição:** Enviar menu interativo (botões, carrosel, lista ou enquete)

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999",
  "type": "list",
  "text": "Escolha uma opção:",
  "footerText": "Menu de serviços",
  "listButton": "Ver opções",
  "selectableCount": 1,
  "choices": [
    "string"
  ],
  "imageButton": "https://exemplo.com/imagem-botao.jpg",
  "replyid": "3EB0538DA65A59F6D8A251",
  "mentions": "5511999999999,5511888888888",
  "readchat": true,
  "readmessages": true,
  "delay": 1000,
  "track_source": "chatwoot",
  "track_id": "msg_123456789",
  "async": false
}
```

---

#### `POST /send/carousel`

**Descrição:** Enviar carrossel de mídia com botões

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999",
  "text": "Nossos Produtos em Destaque",
  "carousel": [
    {
      "text": "Smartphone XYZ\nO mais avançado smartphone da linha",
      "image": "https://exemplo.com/produto1.jpg",
      "video": "https://exemplo.com/produto1.mp4",
      "document": "https://exemplo.com/catalogo.pdf",
      "filename": "Catalogo.pdf",
      "buttons": [
        {
          "id": "buy_xyz",
          "text": "Comprar Agora",
          "type": "REPLY"
        }
      ]
    }
  ],
  "delay": 1000,
  "readchat": true,
  "readmessages": true,
  "replyid": "3EB0538DA65A59F6D8A251",
  "mentions": "5511999999999,5511888888888",
  "forward": false,
  "async": false,
  "track_source": "chatwoot",
  "track_id": "msg_123456789"
}
```

---

#### `POST /send/location-button`

**Descrição:** Solicitar localização do usuário

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999",
  "text": "Por favor, compartilhe sua localização",
  "delay": 0,
  "readchat": true,
  "readmessages": true,
  "replyid": "3EB0538DA65A59F6D8A251",
  "mentions": "5511999999999,5511888888888",
  "async": false,
  "track_source": "chatwoot",
  "track_id": "msg_123456789"
}
```

---

#### `POST /send/request-payment`

**Descrição:** Solicitar pagamento

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999",
  "title": "Detalhes do pedido",
  "text": "Pedido #123 pronto para pagamento",
  "footer": "Loja Exemplo",
  "itemName": "Assinatura Plano Ouro",
  "invoiceNumber": "PED-123",
  "amount": 199.9,
  "pixKey": "123e4567-e89b-12d3-a456-426614174000",
  "pixType": "EVP",
  "pixName": "Loja Exemplo",
  "paymentLink": "https://pagamentos.exemplo.com/checkout/abc",
  "fileUrl": "https://cdn.exemplo.com/boleto-123.pdf",
  "fileName": "boleto-123.pdf",
  "boletoCode": "34191.79001 01043.510047 91020.150008 5 91070026000",
  "replyid": "string",
  "mentions": "string",
  "delay": 0,
  "readchat": false,
  "readmessages": false,
  "async": false,
  "track_source": "string",
  "track_id": "string"
}
```

---

#### `POST /send/pix-button`

**Descrição:** Enviar botão PIX

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999",
  "pixType": "EVP",
  "pixKey": "123e4567-e89b-12d3-a456-426614174000",
  "pixName": "Loja Exemplo",
  "async": false,
  "delay": 0,
  "readchat": false,
  "readmessages": false,
  "replyid": "string",
  "mentions": "string",
  "track_source": "string",
  "track_id": "string"
}
```

---

### Etiquetas

#### `POST /chat/labels`

**Descrição:** Gerencia labels de um chat

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "number": "5511999999999",
  "labelids": [
    "string"
  ],
  "add_labelid": "10",
  "remove_labelid": "20"
}
```

---

#### `POST /label/edit`

**Descrição:** Editar etiqueta

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "labelid": "25",
  "name": "responder editado",
  "color": 2,
  "delete": false
}
```

---

#### `GET /labels`

**Descrição:** Buscar todas as etiquetas

---

### Funções API dos Agentes

#### `POST /function/edit`

**Descrição:** Criar/Editar função para integração com APIs externas

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "id": "string",
  "delete": false,
  "function": {
    "name": "createProduct",
    "active": false,
    "description": "Cria um novo produto no catálogo",
    "method": "POST",
    "endpoint": "https://api.example.com/products",
    "headers": {},
    "body": {},
    "parameters": [
      {
        "name": "string",
        "type": "string",
        "description": "string",
        "required": false,
        "enum": "string",
        "minimum": "<number>",
        "maximum": "<number>"
      }
    ]
  }
}
```

---

#### `GET /function/list`

**Descrição:** Lista todas as funções de API

---

### Grupos e Comunidades

#### `POST /group/create`

**Descrição:** Criar um novo grupo

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "name": "uazapiGO grupo",
  "participants": [
    "string"
  ]
}
```

---

#### `POST /group/info`

**Descrição:** Obter informações detalhadas de um grupo

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "groupjid": "120363153742561022@g.us",
  "getInviteLink": true,
  "getRequestsParticipants": false,
  "force": false
}
```

---

#### `POST /group/inviteInfo`

**Descrição:** Obter informações de um grupo pelo código de convite

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "invitecode": "string"
}
```

---

#### `POST /group/join`

**Descrição:** Entrar em um grupo usando código de convite

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "invitecode": "https://chat.whatsapp.com/IYnl5Zg9bUcJD32rJrDzO7"
}
```

---

#### `POST /group/leave`

**Descrição:** Sair de um grupo

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "groupjid": "120363324255083289@g.us"
}
```

---

#### `GET /group/list`

**Descrição:** Listar todos os grupos

---

#### `POST /group/list`

**Descrição:** Listar todos os grupos com filtros e paginacao

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "page": 0,
  "pageSize": 0,
  "limit": 0,
  "offset": 0,
  "search": "string",
  "force": false,
  "noParticipants": false
}
```

---

#### `POST /group/resetInviteCode`

**Descrição:** Resetar código de convite do grupo

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "groupjid": "120363308883996631@g.us"
}
```

---

#### `POST /group/updateAnnounce`

**Descrição:** Configurar permissões de envio de mensagens no grupo

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "groupjid": "120363339858396166@g.us",
  "announce": true
}
```

---

#### `POST /group/updateDescription`

**Descrição:** Atualizar descrição do grupo

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "groupjid": "120363339858396166@g.us",
  "description": "Grupo oficial de suporte"
}
```

---

#### `POST /group/updateImage`

**Descrição:** Atualizar imagem do grupo

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "groupjid": "120363308883996631@g.us",
  "image": "string"
}
```

---

#### `POST /group/updateLocked`

**Descrição:** Configurar permissão de edição do grupo

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "groupjid": "120363308883996631@g.us",
  "locked": true
}
```

---

#### `POST /group/updateName`

**Descrição:** Atualizar nome do grupo

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "groupjid": "120363339858396166@g.us",
  "name": "Grupo de Suporte"
}
```

---

#### `POST /group/updateParticipants`

**Descrição:** Gerenciar participantes do grupo

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "groupjid": "120363308883996631@g.us",
  "action": "promote",
  "participants": [
    "string"
  ]
}
```

---

#### `POST /community/create`

**Descrição:** Criar uma comunidade

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "name": "Comunidade do Bairro"
}
```

---

#### `POST /community/editgroups`

**Descrição:** Gerenciar grupos em uma comunidade

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "community": "120363153742561022@g.us",
  "action": "string",
  "groupjids": [
    "string"
  ]
}
```

---

### Instancia

#### `POST /instance/connect`

**Descrição:** Conectar instância ao WhatsApp

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "phone": "5511999999999"
}
```

---

#### `POST /instance/disconnect`

**Descrição:** Desconectar instância

---

#### `GET /instance/status`

**Descrição:** Verificar status da instância

---

#### `POST /instance/updateInstanceName`

**Descrição:** Atualizar nome da instância

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "name": "Minha Nova Instância 2024!@#"
}
```

---

#### `DELETE /instance`

**Descrição:** Deletar instância

---

#### `GET /instance/privacy`

**Descrição:** Buscar configurações de privacidade

---

#### `POST /instance/privacy`

**Descrição:** Alterar configurações de privacidade

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "groupadd": "string",
  "last": "string",
  "status": "string",
  "profile": "string",
  "readreceipts": "string",
  "online": "string",
  "calladd": "string"
}
```

---

#### `POST /instance/presence`

**Descrição:** Atualizar status de presença da instância

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "presence": "available"
}
```

---

### Integração Chatwoot

#### `GET /chatwoot/config`

**Descrição:** Obter configuração do Chatwoot

---

#### `PUT /chatwoot/config`

**Descrição:** Atualizar configuração do Chatwoot

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "enabled": true,
  "url": "https://app.chatwoot.com",
  "access_token": "pXXGHHHyJPYHYgWHJHYHgJjj",
  "account_id": 1,
  "inbox_id": 5,
  "ignore_groups": false,
  "sign_messages": true,
  "create_new_conversation": false
}
```

---

### Mensagem em massa

#### `POST /sender/simple`

**Descrição:** Criar nova campanha (Simples)

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "numbers": [
    "string"
  ],
  "type": "string",
  "folder": "Campanha Janeiro",
  "delayMin": 10,
  "delayMax": 30,
  "scheduled_for": 1706198400000,
  "info": "string",
  "delay": 0,
  "mentions": "string",
  "text": "string",
  "linkPreview": false,
  "linkPreviewTitle": "string",
  "linkPreviewDescription": "string",
  "linkPreviewImage": "string",
  "linkPreviewLarge": false,
  "file": "string",
  "docName": "string",
  "fullName": "string",
  "phoneNumber": "string",
  "organization": "string",
  "email": "string",
  "url": "string",
  "latitude": "<number>",
  "longitude": "<number>",
  "name": "string",
  "address": "string",
  "footerText": "string",
  "buttonText": "string",
  "listButton": "string",
  "selectableCount": 0,
  "choices": [
    "string"
  ],
  "imageButton": "string"
}
```

---

#### `POST /sender/advanced`

**Descrição:** Criar envio em massa avançado

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "delayMin": 3,
  "delayMax": 6,
  "info": "Campanha de lançamento",
  "scheduled_for": 1,
  "messages": [
    {
      "number": "5511999999999",
      "type": "string",
      "text": "string",
      "file": "string",
      "docName": "string",
      "linkPreview": false,
      "linkPreviewTitle": "string",
      "linkPreviewDescription": "string",
      "linkPreviewImage": "string",
      "linkPreviewLarge": false,
      "fullName": "string",
      "phoneNumber": "string",
      "organization": "string",
      "email": "string",
      "url": "string",
      "latitude": "<number>",
      "longitude": "<number>",
      "name": "string",
      "address": "string",
      "footerText": "string",
      "buttonText": "string",
      "listButton": "string",
      "selectableCount": 0,
      "choices": [
        "string"
      ],
      "imageButton": "string"
    }
  ]
}
```

---

#### `POST /sender/edit`

**Descrição:** Controlar campanha de envio em massa

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "folder_id": "folder_123",
  "action": "stop"
}
```

---

#### `POST /sender/cleardone`

**Descrição:** Limpar mensagens enviadas

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "hours": 168
}
```

---

#### `DELETE /sender/clearall`

**Descrição:** Limpar toda fila de mensagens

---

#### `GET /sender/listfolders`

**Descrição:** Listar campanhas de envio

---

#### `POST /sender/listmessages`

**Descrição:** Listar mensagens de uma campanha

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "folder_id": "string",
  "messageStatus": "string",
  "page": 0,
  "pageSize": 0
}
```

---

### Perfil

#### `POST /profile/name`

**Descrição:** Altera o nome do perfil do WhatsApp

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "name": "Minha Empresa - Atendimento"
}
```

---

#### `POST /profile/image`

**Descrição:** Altera a imagem do perfil do WhatsApp

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "image": "https://picsum.photos/640/640.jpg"
}
```

---

### Proxy

#### `GET /instance/proxy`

**Descrição:** Obter configuração de proxy da instância

---

#### `POST /instance/proxy`

**Descrição:** Configurar ou alterar o proxy

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "enable": false,
  "proxy_url": "http://usuario:senha@ip:porta"
}
```

---

#### `DELETE /instance/proxy`

**Descrição:** Remover o proxy configurado

---

### Respostas Rápidas

#### `POST /quickreply/edit`

**Descrição:** Criar, atualizar ou excluir resposta rápida

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "id": "rb9da9c03637452",
  "delete": false,
  "shortCut": "saudacao1",
  "type": "string",
  "text": "Olá! Como posso ajudar hoje?",
  "file": "https://exemplo.com/arquivo.pdf",
  "docName": "apresentacao.pdf"
}
```

---

#### `GET /quickreply/showall`

**Descrição:** Listar todas as respostas rápidas

---

### Webhooks e SSE

#### `GET /webhook`

**Descrição:** Ver Webhook da Instância

---

#### `POST /webhook`

**Descrição:** Configurar Webhook da Instância

**Corpo da Requisição (Exemplo JSON):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "enabled": true,
  "url": "https://example.com/webhook",
  "events": [
    "connection"
  ],
  "excludeMessages": [
    "wasSentByApi"
  ],
  "addUrlEvents": false,
  "addUrlTypesMessages": false,
  "action": "string"
}
```

---

#### `GET /sse`

**Descrição:** Server-Sent Events (SSE)

---

