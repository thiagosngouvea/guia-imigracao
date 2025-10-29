# Guia do Script EB2 NIW - Análise de Casos Negados

Este documento explica como usar o script Python fornecido para análise de casos EB2 NIW negados pelo USCIS.

## Visão Geral

O script `process_eb2niw_prongs_compare.py` foi integrado ao sistema web MoveEasy como uma ferramenta de análise avançada que permite:

- Analisar casos reais negados pelo USCIS
- Comparar seu caso pessoal com os casos negados
- Obter insights sobre pontos fortes e fracos
- Calcular uma estimativa de taxa de sucesso

## Como Funciona

### 1. Script Original vs. Integração Web

**Script Python Original:**
- Processa PDFs diretamente via URLs
- Usa OpenAI GPT-4o para análise
- Salva resultados em CSV
- Execução local/batch

**Integração Web (MoveEasy):**
- Interface web amigável
- Streaming de resultados em tempo real
- Armazenamento na nuvem
- Análise comparativa visual

### 2. Fluxo de Análise

1. **Entrada do Usuário:**
   - Descrição dos 3 prongs do seu caso NIW
   - Upload do arquivo Master_file com links dos PDFs
   - Definição do range de análise (linhas inicial e final)

2. **Processamento:**
   - Extração de texto dos PDFs via URLs
   - Análise com OpenAI GPT-4o
   - Comparação com seu caso
   - Classificação dos resultados

3. **Saída:**
   - Tabela com resultados detalhados
   - Estatísticas de sucesso
   - Recomendações personalizadas

## Configuração do Script Original

### Requisitos

```bash
pip install openai requests PyMuPDF csv
```

### Variáveis de Configuração

```python
# Configurações principais
openai.api_key = "sua-chave-openai-aqui"
model_name = "gpt-4o"
batch_size = 50
sleep_time = 10
start_line = 1      # Linha inicial do arquivo Master_file
end_line = 30       # Linha final (recomendado começar com 10-30 casos)
```

### Seu Caso NIW

```python
my_case = {
    "Prong1": "Strong: working on cutting-edge technology aligned with U.S. innovation goals.",
    "Prong2": "5+ years professional experience in major U.S. organizations, demonstrated leadership roles.",
    "Prong3": "Immediate contribution to national innovation efforts; delay would harm competitiveness."
}
```

## Arquivo Master_file

O arquivo Master_file deve conter:
- Um link de PDF por linha
- Links diretos para documentos USCIS
- Formato de texto simples (.txt)

Exemplo:
```
https://uscis.gov/decision1.pdf
https://uscis.gov/decision2.pdf
https://uscis.gov/decision3.pdf
```

## Critérios de Análise

### Prong 1 - Substantial Merit and National Importance
- Mérito substancial do trabalho
- Importância nacional da área
- Impacto potencial nos EUA

### Prong 2 - Well Positioned to Advance Endeavor
- Qualificações do candidato
- Experiência relevante
- Posição para avançar a área

### Prong 3 - Balance of Factors
- Benefício aos EUA
- Justificativa para dispensar PERM
- Urgência nacional

## Interpretação dos Resultados

### Vereditos Possíveis

- **"Your case stronger"**: Seu caso é mais forte que o caso negado
- **"Your case much stronger"**: Seu caso é significativamente mais forte
- **"Your case slightly stronger"**: Seu caso é ligeiramente mais forte
- **"Mixed or equal"**: Casos similares ou inconclusivos

### Taxa de Sucesso

A taxa de sucesso é calculada baseada na porcentagem de casos onde seu caso foi considerado mais forte que os casos negados.

## Limitações e Considerações

### Limitações do Script

1. **Rate Limiting**: OpenAI tem limites de requisições
2. **Custo**: Cada análise consome tokens da API
3. **Qualidade dos PDFs**: Nem todos os PDFs podem ser processados
4. **Subjetividade**: Análise baseada em IA pode ter viés

### Considerações Legais

- **Não é aconselhamento jurídico**: Resultados são apenas informativos
- **Consulte um advogado**: Sempre busque orientação legal especializada
- **Casos únicos**: Cada petição NIW é única
- **Mudanças na lei**: Critérios podem mudar ao longo do tempo

## Uso na Plataforma MoveEasy

### Vantagens da Integração Web

1. **Interface Amigável**: Não precisa configurar Python
2. **Base de Dados Integrada**: Arquivo Master_file já disponível no servidor
3. **Streaming em Tempo Real**: Acompanhe o progresso da análise
4. **Visualização Avançada**: Gráficos e tabelas interativas
5. **Armazenamento**: Resultados salvos automaticamente
6. **Segurança**: Chaves API gerenciadas pelo sistema

### Acesso ao Módulo

1. Faça login na plataforma MoveEasy
2. Navegue para "EB2 NIW" no menu principal
3. Preencha os dados do seu caso (3 prongs)
4. Defina o range de análise (casos a processar)
5. Inicie a análise

**Nota**: O arquivo Master_file com mais de 7.800 casos está disponível automaticamente no servidor, eliminando a necessidade de upload manual.

## Melhores Práticas

### Preparação do Caso

1. **Seja Específico**: Descreva seus prongs com detalhes
2. **Use Métricas**: Inclua números e dados concretos
3. **Destaque Diferenças**: Enfatize o que torna seu caso único
4. **Contexto Nacional**: Conecte seu trabalho aos interesses americanos

### Interpretação dos Resultados

1. **Não se Baseie Apenas na IA**: Use como uma ferramenta adicional
2. **Analise Padrões**: Procure tendências nos casos negados
3. **Identifique Fraquezas**: Use insights para fortalecer sua petição
4. **Busque Orientação**: Discuta resultados com advogado especializado

## Suporte e Troubleshooting

### Problemas Comuns

- **PDFs não processados**: Alguns links podem estar inacessíveis
- **Análise incompleta**: Verifique conectividade e limites da API
- **Resultados inconsistentes**: IA pode interpretar diferentemente

### Contato

Para suporte técnico ou dúvidas sobre o módulo EB2 NIW:
- Email: support@moveeasy.com
- Chat: Disponível na plataforma
- Especialista: Agende consultoria especializada

---

**Disclaimer**: Esta ferramenta é para fins educacionais e informativos apenas. Não constitui aconselhamento jurídico. Sempre consulte um advogado especializado em imigração para orientação específica sobre seu caso NIW.
