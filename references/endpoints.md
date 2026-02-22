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

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/instance/init` | Criar Instancia |
| `GET` | `/instance/all` | Listar todas as instâncias |
| `POST` | `/instance/updateAdminFields` | Atualizar campos administrativos |
| `GET` | `/globalwebhook` | Ver Webhook Global |
| `POST` | `/globalwebhook` | Configurar Webhook Global |

### Ações na mensagem e Buscar

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/message/download` | Baixar arquivo de uma mensagem |
| `POST` | `/message/find` | Buscar mensagens em um chat |
| `POST` | `/message/markread` | Marcar mensagens como lidas |
| `POST` | `/message/react` | Enviar reação a uma mensagem |
| `POST` | `/message/delete` | Apagar Mensagem Para Todos |
| `POST` | `/message/edit` | Edita uma mensagem enviada |

### Bloqueios

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/chat/block` | Bloqueia ou desbloqueia contato do WhatsApp |
| `GET` | `/chat/blocklist` | Lista contatos bloqueados |

### Business

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/business/get/profile` | Obter o perfil comercial |
| `GET` | `/business/get/categories` | Obter as categorias de negócios |
| `POST` | `/business/update/profile` | Atualizar o perfil comercial |
| `POST` | `/business/catalog/list` | Listar os produtos do catálogo |
| `POST` | `/business/catalog/info` | Obter informações de um produto do catálogo |
| `POST` | `/business/catalog/delete` | Deletar um produto do catálogo |
| `POST` | `/business/catalog/show` | Mostrar um produto do catálogo |
| `POST` | `/business/catalog/hide` | Ocultar um produto do catálogo |

### CRM

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/instance/updateFieldsMap` | Atualizar campos personalizados de leads |
| `POST` | `/chat/editLead` | Edita informações de lead |

### Chamadas

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/call/make` | Iniciar chamada de voz |
| `POST` | `/call/reject` | Rejeitar chamada recebida |

### Chatbot Configurações

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/instance/updatechatbotsettings` | Chatbot Configurações |

### Chatbot Trigger

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/trigger/edit` | Criar, atualizar ou excluir um trigger do chatbot |
| `GET` | `/trigger/list` | Listar todos os triggers do chatbot |

### Chats

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/chat/delete` | Deleta chat |
| `POST` | `/chat/archive` | Arquivar/desarquivar chat |
| `POST` | `/chat/read` | Marcar chat como lido/não lido |
| `POST` | `/chat/mute` | Silenciar chat |
| `POST` | `/chat/pin` | Fixar/desafixar chat |
| `POST` | `/chat/find` | Busca chats com filtros |

### Configuração do Agente de IA

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/agent/edit` | Criar/Editar Agente |
| `GET` | `/agent/list` | Todos os agentes |

### Conhecimento dos Agentes

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/knowledge/edit` | Criar/Editar Conhecimento do Agente |
| `GET` | `/knowledge/list` | Listar Base de Conhecimento |

### Contatos

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/contacts` | Retorna lista de contatos do WhatsApp |
| `POST` | `/contacts/list` | Listar todos os contatos com paginacao |
| `POST` | `/contact/add` | Adiciona um contato à agenda |
| `POST` | `/contact/remove` | Remove um contato da agenda |
| `POST` | `/chat/details` | Obter Detalhes Completos |
| `POST` | `/chat/check` | Verificar Números no WhatsApp |

### Enviar Mensagem

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/send/text` | Enviar mensagem de texto |
| `POST` | `/send/media` | Enviar mídia (imagem, vídeo, áudio ou documento) |
| `POST` | `/send/contact` | Enviar cartão de contato (vCard) |
| `POST` | `/send/location` | Enviar localização geográfica |
| `POST` | `/message/presence` | Enviar atualização de presença |
| `POST` | `/send/status` | Enviar Stories (Status) |
| `POST` | `/send/menu` | Enviar menu interativo (botões, carrosel, lista ou enquete) |
| `POST` | `/send/carousel` | Enviar carrossel de mídia com botões |
| `POST` | `/send/location-button` | Solicitar localização do usuário |
| `POST` | `/send/request-payment` | Solicitar pagamento |
| `POST` | `/send/pix-button` | Enviar botão PIX |

### Etiquetas

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/chat/labels` | Gerencia labels de um chat |
| `POST` | `/label/edit` | Editar etiqueta |
| `GET` | `/labels` | Buscar todas as etiquetas |

### Funções API dos Agentes

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/function/edit` | Criar/Editar função para integração com APIs externas |
| `GET` | `/function/list` | Lista todas as funções de API |

### Grupos e Comunidades

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/group/create` | Criar um novo grupo |
| `POST` | `/group/info` | Obter informações detalhadas de um grupo |
| `POST` | `/group/inviteInfo` | Obter informações de um grupo pelo código de convite |
| `POST` | `/group/join` | Entrar em um grupo usando código de convite |
| `POST` | `/group/leave` | Sair de um grupo |
| `GET` | `/group/list` | Listar todos os grupos |
| `POST` | `/group/list` | Listar todos os grupos com filtros e paginacao |
| `POST` | `/group/resetInviteCode` | Resetar código de convite do grupo |
| `POST` | `/group/updateAnnounce` | Configurar permissões de envio de mensagens no grupo |
| `POST` | `/group/updateDescription` | Atualizar descrição do grupo |
| `POST` | `/group/updateImage` | Atualizar imagem do grupo |
| `POST` | `/group/updateLocked` | Configurar permissão de edição do grupo |
| `POST` | `/group/updateName` | Atualizar nome do grupo |
| `POST` | `/group/updateParticipants` | Gerenciar participantes do grupo |
| `POST` | `/community/create` | Criar uma comunidade |
| `POST` | `/community/editgroups` | Gerenciar grupos em uma comunidade |

### Instancia

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/instance/connect` | Conectar instância ao WhatsApp |
| `POST` | `/instance/disconnect` | Desconectar instância |
| `GET` | `/instance/status` | Verificar status da instância |
| `POST` | `/instance/updateInstanceName` | Atualizar nome da instância |
| `DELETE` | `/instance` | Deletar instância |
| `GET` | `/instance/privacy` | Buscar configurações de privacidade |
| `POST` | `/instance/privacy` | Alterar configurações de privacidade |
| `POST` | `/instance/presence` | Atualizar status de presença da instância |

### Integração Chatwoot

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/chatwoot/config` | Obter configuração do Chatwoot |
| `PUT` | `/chatwoot/config` | Atualizar configuração do Chatwoot |

### Mensagem em massa

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/sender/simple` | Criar nova campanha (Simples) |
| `POST` | `/sender/advanced` | Criar envio em massa avançado |
| `POST` | `/sender/edit` | Controlar campanha de envio em massa |
| `POST` | `/sender/cleardone` | Limpar mensagens enviadas |
| `DELETE` | `/sender/clearall` | Limpar toda fila de mensagens |
| `GET` | `/sender/listfolders` | Listar campanhas de envio |
| `POST` | `/sender/listmessages` | Listar mensagens de uma campanha |

### Perfil

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/profile/name` | Altera o nome do perfil do WhatsApp |
| `POST` | `/profile/image` | Altera a imagem do perfil do WhatsApp |

### Proxy

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/instance/proxy` | Obter configuração de proxy da instância |
| `POST` | `/instance/proxy` | Configurar ou alterar o proxy |
| `DELETE` | `/instance/proxy` | Remover o proxy configurado |

### Respostas Rápidas

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/quickreply/edit` | Criar, atualizar ou excluir resposta rápida |
| `GET` | `/quickreply/showall` | Listar todas as respostas rápidas |

### Webhooks e SSE

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/webhook` | Ver Webhook da Instância |
| `POST` | `/webhook` | Configurar Webhook da Instância |
| `GET` | `/sse` | Server-Sent Events (SSE) |

