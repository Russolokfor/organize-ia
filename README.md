# Organize.ia

Organize.ia é uma aplicação web premium de produtividade, projetada para transformar suas tarefas em uma rotina diária executável. Ela evita a complexidade de sistemas como o Notion ou Trello, focando puramente em: **organização → definição da rotina → execução → medição de desempenho**.

Feita com Next.js 15, Tailwind CSS v4, Framer Motion, e Supabase.

## Arquitetura 

- **Frontend**: Next.js App Router com Server Components onde possível, e Client Components hidratados para interações ricas (Framer Motion).
- **Estilização**: Tailwind CSS v4 com `globals.css` definindo variáveis de um tema escuro e visual premium.
- **Backend / Auth**: Supabase. Usado para autenticação segura e banco de dados rápido, garantido via RLS (Row Level Security).
- **Integração de IA**: Rota `/api/ai/parse` capaz de interceptar inputs em texto livre ("brain dumps") e estruturar rapidamente em blocos acionáveis de tempo com prioridade. Utiliza a API do Gemini. 

## Como Configurar

1. **Conta Supabase**:
   Crie um projeto no Supabase (https://supabase.com). 
   Na raiz do repositório, encontre o arquivo `supabase_schema.sql` e execute-o dentro da interface do SQL Editor do seu projeto Supabase. Ele cuidará de criar a tabela `tasks` e todas as regras de segurança necessárias (RLS).

2. **Variáveis de Ambiente**:
   Copie `.env.local.example` para `.env.local` e insira as credenciais do seu projeto:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
   GEMINI_API_KEY=sua_api_key_do_google_gemini
   ```
   *(Nota: A API do Gemini é opcional; se não declarada, o sistema usa uma lógica mock inteligente no lugar.)*

3. **Rodando a Aplicação**:
   Instale as dependências com `npm install`, depois inicie o servidor:

   ```bash
   npm run dev
   ```
   Acesse a aplicação em `http://localhost:3000`. Crie uma conta no formulário de Login.

## Melhorias Futuras

A arquitetura foi pensada para escalar. Algumas implementações futuras:
- Subtarefas (`parent_id` na tabela `tasks`).
- Energias e categorias avançadas.
- Sincronização offline ou persistência de caches no `TaskProvider`.
- Testes automatizados (E2E) com Playwright.
