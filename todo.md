# Minha Loja Online — TODO

## Banco de Dados & Backend
- [x] Schema: tabelas categories, products, product_images, orders, order_items, cart_items
- [x] Migração e aplicação do SQL no banco
- [x] Router: categorias (listar, criar, editar, deletar)
- [x] Router: produtos (listar com filtros, busca, detalhe, criar, editar, deletar)
- [x] Router: carrinho (adicionar, remover, atualizar quantidade, limpar)
- [x] Router: pedidos (criar, listar por usuário, listar todos para admin)
- [x] Router: admin (dashboard stats, gerenciar produtos, gerenciar categorias)
- [x] Upload de imagens de produtos via S3

## Design System Art Deco
- [x] Fontes serifadas (Playfair Display + Cormorant Garamond) via Google Fonts
- [x] Paleta: preto profundo, dourado metálico, branco marfim
- [x] CSS global com variáveis de tema Art Deco
- [x] Componentes ornamentais: divisores dourados, molduras angulares, badges luxuosos

## Frontend — Páginas Públicas
- [x] Página inicial: banner hero, seção de categorias em destaque, vitrine de promoções
- [x] Catálogo: grid de produtos com filtros (categoria, faixa de preço, busca)
- [x] Página de detalhes do produto: galeria de imagens, descrição, preço, botão carrinho
- [x] Carrinho: lista de itens, quantidades, subtotal, botão checkout
- [x] Checkout: resumo do pedido, formulário de dados, integração Stripe
- [x] Histórico de pedidos do usuário (rota protegida)
- [x] Página de confirmação de pedido

## Frontend — Painel Administrativo
- [x] Layout do painel admin com abas (Dashboard, Produtos, Categorias, Pedidos)
- [x] Dashboard: estatísticas (total vendas, pedidos, produtos, categorias)
- [x] Gerenciar categorias (CRUD)
- [x] Gerenciar produtos (CRUD + upload de imagens)
- [x] Visualizar pedidos realizados

## Integrações
- [x] Stripe: criação de sessão de checkout
- [x] Stripe: webhook para confirmar pagamento
- [x] Upload de imagens para S3 (painel admin)

## Testes
- [x] Testes vitest para routers principais (14 testes passando)
- [x] Checkpoint final


## Fluxo de Comprovante de Pagamento (Nova Feature)
- [x] Criar tabela `payment_proofs` no banco de dados
- [x] Migração SQL para a nova tabela
- [x] Router: upload de comprovante com armazenamento em S3
- [x] Router: listar comprovantes (admin)
- [x] Router: aprovar/rejeitar comprovante (admin)
- [x] Página: upload de comprovante para cliente (pós-pagamento)
- [x] Página admin: análise de comprovantes com aprovação/rejeição
- [x] Aba de comprovantes integrada no painel admin
- [x] Upload real de comprovantes para S3 (storagePut)
- [x] TypeScript compilando sem erros


## Integração PIX (Nova Feature)
- [x] Adicionar coluna de método de pagamento na tabela orders
- [x] Armazenar chave PIX do administrador nas variáveis de ambiente
- [x] Router: criar pedido com opção de pagamento PIX
- [x] Página de checkout: opção de escolher entre Stripe e PIX
- [x] Página de instruções PIX: exibir chave PIX e instruções de pagamento
- [x] Botão para enviar comprovante do PIX
- [x] Fluxo de comprovante PIX integrado com validação manual
- [x] TypeScript compilando sem erros


## Data de Entrega Prevista (Nova Feature)
- [x] Adicionar coluna estimatedDeliveryDate na tabela orders
- [x] Migração SQL para a nova coluna
- [x] Router: atualizar data de entrega (admin)
- [x] Página Meus Pedidos: exibir data de entrega prevista e status
- [x] Painel Admin: interface para definir data de entrega por pedido
- [x] TypeScript compilando sem erros
