# 🎯 API de Ativação/Desativação de Oportunidades - TalentLink

## Visão Geral

A API de ativação/desativação de oportunidades permite que usuários RH controlem o status de suas vagas, incluindo:

- ✅ **Ativar oportunidade**: Tornar uma vaga visível e disponível para candidatos
- ❌ **Desativar oportunidade**: Ocultar uma vaga sem deletá-la permanentemente
- 📊 **Controle de visibilidade**: Gerenciar quais oportunidades estão ativas no sistema
- 🔒 **Segurança**: Apenas o RH criador da vaga pode alterar seu status

## Estrutura de Dados

### Opportunity (Oportunidade)
```typescript
interface Opportunity {
  id: string;                    // ID único da oportunidade
  title: string;                 // Título da vaga
  description: string;           // Descrição da vaga
  location: string;              // Localização da vaga
  companyId: string;             // ID da empresa
  formId?: string;               // ID do formulário (opcional)
  requirements?: string;         // Requisitos da vaga
  benefits?: string;             // Benefícios oferecidos
  isActive: boolean;             // Status de ativação da vaga
  createdAt: Date;              // Data de criação
  company: Company;             // Dados da empresa
  form?: Form;                  // Formulário associado
  responses: Response[];         // Respostas dos candidatos
}
```

### Status da Oportunidade
```typescript
interface OpportunityStatus {
  isActive: boolean;             // true = ativa, false = inativa
}
```

## Endpoints Disponíveis

### 🟢 **Ativar Oportunidade**

#### 1. Ativar Vaga
```http
PATCH /opportunities/{opportunityId}/activate
Authorization: Bearer <token_jwt_rh>
```

**Descrição:** Ativa uma oportunidade específica, tornando-a visível para candidatos.

**Parâmetros:**
- `opportunityId` (string): ID da oportunidade a ser ativada

**Resposta de Sucesso (200):**
```json
"Oportunidade ativada com sucesso."
```

**Resposta se não encontrada (404):**
```json
"Oportunidade não encontrada."
```

**Resposta se sem permissão (403):**
```json
"Sem permissão para ativar esta oportunidade."
```

### 🔴 **Desativar Oportunidade**

#### 2. Desativar Vaga
```http
PATCH /opportunities/{opportunityId}/deactivate
Authorization: Bearer <token_jwt_rh>
```

**Descrição:** Desativa uma oportunidade específica, ocultando-a de candidatos.

**Parâmetros:**
- `opportunityId` (string): ID da oportunidade a ser desativada

**Resposta de Sucesso (200):**
```json
"Oportunidade desativada com sucesso."
```

**Resposta se não encontrada (404):**
```json
"Oportunidade não encontrada."
```

**Resposta se sem permissão (403):**
```json
"Sem permissão para desativar esta oportunidade."
```

## ⚠️ Soluções de Problemas Comuns

### 🚫 **Erro de CORS com Método PATCH**

**Problema:**
```
Requisição cross-origin bloqueada: A diretiva Same Origin (mesma origem) não permite a leitura do recurso remoto... (motivo: método não encontrado no cabeçalho 'Access-Control-Allow-Methods' do CORS)
```

**Solução:**
O método `PATCH` precisa estar configurado no CORS do servidor. Verifique se o backend inclui:

```typescript
// No app.ts do backend
const corsOptions = {
  origin: [...],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // ✅ PATCH incluído
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};
```

### 🔒 **Erro 401 - Token Inválido**

**Problema:**
```
Token de autenticação inválido
```

**Soluções:**
1. Verificar se o token existe no localStorage
2. Verificar se o token não expirou
3. Fazer novo login se necessário

```typescript
// Verificação de token
const token = localStorage.getItem('authToken');
if (!token) {
  // Redirecionar para login
  window.location.href = '/login';
  return;
}
```

### 🚫 **Erro 403 - Sem Permissão**

**Problema:**
```
Sem permissão para ativar/desativar esta oportunidade
```

**Causa:** Apenas o RH que criou a oportunidade pode alterar seu status.

**Solução:** Verificar se o usuário logado é o criador da oportunidade antes de mostrar os controles.

### 🔍 **Erro 404 - Oportunidade Não Encontrada**

**Problema:**
```
Oportunidade não encontrada
```

**Soluções:**
1. Verificar se o ID da oportunidade está correto
2. Verificar se a oportunidade não foi deletada
3. Atualizar a lista de oportunidades

### 📡 **Erro de Rede**

**Problema:**
```
Network Error
```

**Soluções:**
1. Verificar conexão com internet
2. Verificar se o servidor está online
3. Verificar URL da API
4. Implementar retry automático

```typescript
// Exemplo de retry
const retryRequest = async (fn: () => Promise<any>, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

## Códigos de Status

- ✅ **200** - Operação realizada com sucesso
- 🔒 **401** - Token de autenticação inválido
- 🚫 **403** - Acesso negado (apenas RH criador pode alterar)
- ❓ **404** - Oportunidade não encontrada
- 💥 **500** - Erro interno do servidor

## Regras de Negócio

### Acesso
- ⚠️ Apenas usuários com `userType: "RH"` podem ativar/desativar oportunidades
- 🔐 Autenticação JWT obrigatória em ambas as rotas
- 👤 Apenas o RH que criou a oportunidade pode alterar seu status

### Status da Oportunidade
- 🆕 **Novas oportunidades**: Criadas com `isActive: true` por padrão
- 🔄 **Alternância**: Pode ser ativada/desativada quantas vezes necessário
- 👁️ **Visibilidade**: Oportunidades inativas não aparecem para candidatos
- 💾 **Persistência**: Dados não são perdidos, apenas status muda

### 🎯 **Filtragem Automática por Usuário**
O sistema aplica filtros automáticos baseados no tipo de usuário:

#### Para Candidatos (userType: "CANDIDATO"):
- ✅ **Lista geral** (`GET /opportunities`): Apenas `isActive: true`
- ✅ **Busca** (`POST /opportunities/search`): Apenas `isActive: true`
- ✅ **Visualização individual** (`GET /opportunities/:id`): Apenas `isActive: true`
- ℹ️ **Minhas candidaturas** (`GET /opportunities/my-applications`): Todas (ativas e inativas)

#### Para RH (userType: "RH"):
- 👔 **Todas as funções**: Veem oportunidades independente do status
- 🔧 **Gerenciamento**: Podem ativar/desativar suas próprias oportunidades
- 📊 **Relatórios**: Acesso completo a todas as oportunidades

### Impactos da Desativação
- ❌ **Candidatos**: Não podem mais ver ou se candidatar à vaga
  - 🚫 **Lista geral**: Oportunidade não aparece em `GET /opportunities`
  - 🔍 **Busca**: Não aparece nos resultados de `POST /opportunities/search`
  - 👁️ **Visualização individual**: Candidatos recebem 404 ao tentar acessar `GET /opportunities/:id`
- 📊 **Relatórios**: Vaga ainda aparece em relatórios do RH
- 💬 **Respostas**: Respostas existentes são mantidas
- 📱 **Candidaturas**: Candidatos ainda podem ver suas candidaturas em "Minhas Candidaturas"
- 🔄 **Reativação**: Pode ser reativada a qualquer momento

## Integração Frontend

### Service para Ativação de Oportunidades

```typescript
// opportunityActivationService.ts
const API_BASE_URL = 'https://talentlink-wd88.onrender.com';

interface OpportunityActivationResponse {
  message: string;
}

export const opportunityActivationService = {
  // Ativar oportunidade
  async activateOpportunity(opportunityId: string): Promise<string> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log('Ativando oportunidade:', opportunityId);

      const response = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}/activate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Erro ao ativar oportunidade');
      }

      const result = await response.text();
      console.log('Oportunidade ativada:', result);
      return result;
    } catch (error) {
      console.error('Erro ao ativar oportunidade:', error);
      throw error;
    }
  },

  // Desativar oportunidade
  async deactivateOpportunity(opportunityId: string): Promise<string> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log('Desativando oportunidade:', opportunityId);

      const response = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}/deactivate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Erro ao desativar oportunidade');
      }

      const result = await response.text();
      console.log('Oportunidade desativada:', result);
      return result;
    } catch (error) {
      console.error('Erro ao desativar oportunidade:', error);
      throw error;
    }
  },

  // Alternar status da oportunidade
  async toggleOpportunityStatus(opportunityId: string, currentStatus: boolean): Promise<string> {
    try {
      if (currentStatus) {
        return await this.deactivateOpportunity(opportunityId);
      } else {
        return await this.activateOpportunity(opportunityId);
      }
    } catch (error) {
      console.error('Erro ao alternar status da oportunidade:', error);
      throw error;
    }
  },

  // Ativar múltiplas oportunidades
  async activateMultipleOpportunities(opportunityIds: string[]): Promise<{
    successful: string[];
    failed: { id: string; error: string }[];
  }> {
    const results = {
      successful: [] as string[],
      failed: [] as { id: string; error: string }[]
    };

    for (const id of opportunityIds) {
      try {
        await this.activateOpportunity(id);
        results.successful.push(id);
      } catch (error) {
        results.failed.push({
          id,
          error: error.message || 'Erro desconhecido'
        });
      }
    }

    return results;
  },

  // Desativar múltiplas oportunidades
  async deactivateMultipleOpportunities(opportunityIds: string[]): Promise<{
    successful: string[];
    failed: { id: string; error: string }[];
  }> {
    const results = {
      successful: [] as string[],
      failed: [] as { id: string; error: string }[]
    };

    for (const id of opportunityIds) {
      try {
        await this.deactivateOpportunity(id);
        results.successful.push(id);
      } catch (error) {
        results.failed.push({
          id,
          error: error.message || 'Erro desconhecido'
        });
      }
    }

    return results;
  }
};

export type { OpportunityActivationResponse };
```

### Componente React - Switch de Ativação

```tsx
// OpportunityActivationSwitch.tsx
import React, { useState } from 'react';
import { opportunityActivationService } from '../services/opportunityActivationService';

interface OpportunityActivationSwitchProps {
  opportunityId: string;
  initialStatus: boolean;
  opportunityTitle: string;
  onStatusChange?: (newStatus: boolean) => void;
  disabled?: boolean;
}

const OpportunityActivationSwitch: React.FC<OpportunityActivationSwitchProps> = ({
  opportunityId,
  initialStatus,
  opportunityTitle,
  onStatusChange,
  disabled = false
}) => {
  const [isActive, setIsActive] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleToggle = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);
      setError('');
      
      const result = await opportunityActivationService.toggleOpportunityStatus(
        opportunityId, 
        isActive
      );
      
      const newStatus = !isActive;
      setIsActive(newStatus);
      
      if (onStatusChange) {
        onStatusChange(newStatus);
      }

      // Feedback visual opcional
      console.log(result);
      
    } catch (err) {
      setError(err.message || 'Erro ao alterar status da oportunidade');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center">
        <button
          onClick={handleToggle}
          disabled={disabled || loading}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${isActive 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-gray-300 hover:bg-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${loading ? 'opacity-75' : ''}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isActive ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
        
        {loading && (
          <div className="ml-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <span className={`text-sm font-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
          {isActive ? 'Ativa' : 'Inativa'}
        </span>
        <span className="text-xs text-gray-400 truncate max-w-32">
          {opportunityTitle}
        </span>
      </div>

      {error && (
        <div className="ml-2">
          <span className="text-red-500 text-xs" title={error}>
            ⚠️
          </span>
        </div>
      )}
    </div>
  );
};

export default OpportunityActivationSwitch;
```

### Componente React - Botões de Ação

```tsx
// OpportunityActivationButtons.tsx
import React, { useState } from 'react';
import { opportunityActivationService } from '../services/opportunityActivationService';

interface OpportunityActivationButtonsProps {
  opportunityId: string;
  isActive: boolean;
  opportunityTitle: string;
  onStatusChange?: (newStatus: boolean) => void;
  variant?: 'buttons' | 'dropdown';
}

const OpportunityActivationButtons: React.FC<OpportunityActivationButtonsProps> = ({
  opportunityId,
  isActive,
  opportunityTitle,
  onStatusChange,
  variant = 'buttons'
}) => {
  const [loading, setLoading] = useState<'activate' | 'deactivate' | null>(null);
  const [error, setError] = useState<string>('');

  const handleActivate = async () => {
    try {
      setLoading('activate');
      setError('');
      
      await opportunityActivationService.activateOpportunity(opportunityId);
      
      if (onStatusChange) {
        onStatusChange(true);
      }
      
    } catch (err) {
      setError(err.message || 'Erro ao ativar oportunidade');
    } finally {
      setLoading(null);
    }
  };

  const handleDeactivate = async () => {
    try {
      setLoading('deactivate');
      setError('');
      
      await opportunityActivationService.deactivateOpportunity(opportunityId);
      
      if (onStatusChange) {
        onStatusChange(false);
      }
      
    } catch (err) {
      setError(err.message || 'Erro ao desativar oportunidade');
    } finally {
      setLoading(null);
    }
  };

  if (variant === 'dropdown') {
    return (
      <div className="relative inline-block text-left">
        <select
          value={isActive ? 'active' : 'inactive'}
          onChange={(e) => {
            if (e.target.value === 'active' && !isActive) {
              handleActivate();
            } else if (e.target.value === 'inactive' && isActive) {
              handleDeactivate();
            }
          }}
          disabled={loading !== null}
          className={`
            appearance-none bg-white border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
            ${isActive ? 'border-green-300 text-green-700' : 'border-red-300 text-red-700'}
            ${loading ? 'opacity-75 cursor-wait' : 'cursor-pointer'}
          `}
        >
          <option value="active">🟢 Ativa</option>
          <option value="inactive">🔴 Inativa</option>
        </select>
        
        {error && (
          <div className="absolute top-full left-0 mt-1 text-xs text-red-500 bg-white border border-red-200 rounded px-2 py-1 shadow-lg z-10">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      {!isActive && (
        <button
          onClick={handleActivate}
          disabled={loading !== null}
          className={`
            px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors
            ${loading === 'activate' ? 'opacity-75 cursor-wait' : ''}
            ${loading && loading !== 'activate' ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {loading === 'activate' ? (
            <>
              <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Ativando...
            </>
          ) : (
            <>🟢 Ativar</>
          )}
        </button>
      )}

      {isActive && (
        <button
          onClick={handleDeactivate}
          disabled={loading !== null}
          className={`
            px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors
            ${loading === 'deactivate' ? 'opacity-75 cursor-wait' : ''}
            ${loading && loading !== 'deactivate' ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {loading === 'deactivate' ? (
            <>
              <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Desativando...
            </>
          ) : (
            <>🔴 Desativar</>
          )}
        </button>
      )}

      {error && (
        <div className="flex items-center text-red-500 text-sm">
          <span title={error}>⚠️</span>
        </div>
      )}
    </div>
  );
};

export default OpportunityActivationButtons;
```

### Componente React - Lista de Oportunidades com Controle

```tsx
// OpportunityListWithActivation.tsx
import React, { useState, useEffect } from 'react';
import OpportunityActivationSwitch from './OpportunityActivationSwitch';
import { opportunityActivationService } from '../services/opportunityActivationService';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  isActive: boolean;
  createdAt: string;
  company: {
    name: string;
  };
}

interface OpportunityListWithActivationProps {
  opportunities: Opportunity[];
  onOpportunityUpdate?: (updatedOpportunity: Opportunity) => void;
}

const OpportunityListWithActivation: React.FC<OpportunityListWithActivationProps> = ({
  opportunities: initialOpportunities,
  onOpportunityUpdate
}) => {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedOpportunities, setSelectedOpportunities] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    setOpportunities(initialOpportunities);
  }, [initialOpportunities]);

  const handleStatusChange = (opportunityId: string, newStatus: boolean) => {
    setOpportunities(prev => 
      prev.map(opp => 
        opp.id === opportunityId 
          ? { ...opp, isActive: newStatus }
          : opp
      )
    );

    if (onOpportunityUpdate) {
      const updatedOpportunity = opportunities.find(opp => opp.id === opportunityId);
      if (updatedOpportunity) {
        onOpportunityUpdate({ ...updatedOpportunity, isActive: newStatus });
      }
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    if (filterStatus === 'active') return opp.isActive;
    if (filterStatus === 'inactive') return !opp.isActive;
    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOpportunities(new Set(filteredOpportunities.map(opp => opp.id)));
    } else {
      setSelectedOpportunities(new Set());
    }
  };

  const handleSelectOpportunity = (opportunityId: string, checked: boolean) => {
    const newSelected = new Set(selectedOpportunities);
    if (checked) {
      newSelected.add(opportunityId);
    } else {
      newSelected.delete(opportunityId);
    }
    setSelectedOpportunities(newSelected);
  };

  const handleBulkActivation = async (activate: boolean) => {
    if (selectedOpportunities.size === 0) return;

    try {
      setBulkLoading(true);
      const selectedIds = Array.from(selectedOpportunities);
      
      const results = activate 
        ? await opportunityActivationService.activateMultipleOpportunities(selectedIds)
        : await opportunityActivationService.deactivateMultipleOpportunities(selectedIds);

      // Atualizar status das oportunidades bem-sucedidas
      setOpportunities(prev => 
        prev.map(opp => 
          results.successful.includes(opp.id)
            ? { ...opp, isActive: activate }
            : opp
        )
      );

      // Limpar seleção
      setSelectedOpportunities(new Set());

      // Log dos resultados
      console.log(`${results.successful.length} oportunidades ${activate ? 'ativadas' : 'desativadas'} com sucesso`);
      if (results.failed.length > 0) {
        console.error(`${results.failed.length} falharam:`, results.failed);
      }

    } catch (error) {
      console.error('Erro na operação em lote:', error);
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles e Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as oportunidades</option>
            <option value="active">Apenas ativas</option>
            <option value="inactive">Apenas inativas</option>
          </select>

          <span className="text-sm text-gray-500">
            {filteredOpportunities.length} oportunidade(s)
          </span>
        </div>

        {/* Ações em lote */}
        {selectedOpportunities.size > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedOpportunities.size} selecionada(s)
            </span>
            <button
              onClick={() => handleBulkActivation(true)}
              disabled={bulkLoading}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              🟢 Ativar
            </button>
            <button
              onClick={() => handleBulkActivation(false)}
              disabled={bulkLoading}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              🔴 Desativar
            </button>
          </div>
        )}
      </div>

      {/* Header da tabela */}
      <div className="bg-gray-50 p-4 rounded-t-lg">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selectedOpportunities.size === filteredOpportunities.length && filteredOpportunities.length > 0}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="mr-3"
          />
          <span className="text-sm font-medium text-gray-700">Selecionar todas</span>
        </div>
      </div>

      {/* Lista de Oportunidades */}
      <div className="space-y-4">
        {filteredOpportunities.map((opportunity) => (
          <div key={opportunity.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <input
                  type="checkbox"
                  checked={selectedOpportunities.has(opportunity.id)}
                  onChange={(e) => handleSelectOpportunity(opportunity.id, e.target.checked)}
                  className="mt-1"
                />
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{opportunity.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      opportunity.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {opportunity.isActive ? '🟢 Ativa' : '🔴 Inativa'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-2 line-clamp-2">{opportunity.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>📍 {opportunity.location}</span>
                    <span>🏢 {opportunity.company.name}</span>
                    <span>📅 {new Date(opportunity.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {/* Switch de Ativação */}
              <div className="ml-4">
                <OpportunityActivationSwitch
                  opportunityId={opportunity.id}
                  initialStatus={opportunity.isActive}
                  opportunityTitle={opportunity.title}
                  onStatusChange={(newStatus) => handleStatusChange(opportunity.id, newStatus)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">
            Nenhuma oportunidade encontrada
          </h2>
          <p className="text-gray-500">
            {filterStatus === 'active' && 'Não há oportunidades ativas no momento.'}
            {filterStatus === 'inactive' && 'Não há oportunidades inativas no momento.'}
            {filterStatus === 'all' && 'Você ainda não criou nenhuma oportunidade.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default OpportunityListWithActivation;
```

### Hook Personalizado para Ativação

```tsx
// useOpportunityActivation.ts
import { useState, useCallback } from 'react';
import { opportunityActivationService } from '../services/opportunityActivationService';

export const useOpportunityActivation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activateOpportunity = useCallback(async (opportunityId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await opportunityActivationService.activateOpportunity(opportunityId);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao ativar oportunidade';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivateOpportunity = useCallback(async (opportunityId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await opportunityActivationService.deactivateOpportunity(opportunityId);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao desativar oportunidade';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleOpportunityStatus = useCallback(async (opportunityId: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const result = await opportunityActivationService.toggleOpportunityStatus(opportunityId, currentStatus);
      return { newStatus: !currentStatus, message: result };
    } catch (err) {
      const errorMessage = err.message || 'Erro ao alterar status da oportunidade';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    activateOpportunity,
    deactivateOpportunity,
    toggleOpportunityStatus,
    clearError
  };
};
```

## Fluxo de Uso

### 1. **RH faz login**
```http
POST /auth/google/RH
```

### 2. **RH visualiza suas oportunidades**
```typescript
const { opportunities, loading } = useOpportunities();
```

### 3. **RH desativa uma vaga específica**
```http
PATCH /opportunities/{id}/deactivate
```

### 4. **RH reativa a vaga quando necessário**
```http
PATCH /opportunities/{id}/activate
```

### 5. **RH gerencia status em lote**
```typescript
const { toggleOpportunityStatus } = useOpportunityActivation();
await toggleOpportunityStatus(opportunityId, currentStatus);
```

## Casos de Uso

### ✅ Gerenciamento Individual
1. RH vê lista de suas oportunidades
2. Clica no switch/botão de ativação
3. Oportunidade muda status instantaneamente
4. Candidatos veem/não veem a vaga

### ✅ Operações em Lote
1. RH seleciona múltiplas oportunidades
2. Clica em "Ativar todas" ou "Desativar todas"
3. Sistema processa todas simultaneamente
4. Feedback sobre sucessos e falhas

### ✅ Filtros e Visualização
1. RH filtra por status (ativa/inativa)
2. Visualiza apenas oportunidades relevantes
3. Aplica ações conforme necessário
4. Monitora status geral das vagas

## Segurança

- 🔐 **JWT Token obrigatório** em todas as operações
- 👤 **Propriedade verificada**: Apenas criador pode alterar status
- 🎯 **Role-based access**: Apenas RH pode ativar/desativar
- 🛡️ **Validação de existência**: Oportunidade deve existir
- 🔍 **Auditoria**: Todas as alterações são logadas

## Estados da Interface

### 🟢 **Oportunidade Ativa**
- ✅ Visível para candidatos
- ✅ Aceita novas candidaturas
- ✅ Aparece em buscas
- 🎨 **Visual**: Badge verde, switch ligado

### 🔴 **Oportunidade Inativa** 
- ❌ Oculta de candidatos
- ❌ Não aceita candidaturas
- ❌ Não aparece em buscas
- 🎨 **Visual**: Badge vermelho, switch desligado

### ⏳ **Estados de Loading**
- 🔄 Spinner durante operação
- 🚫 Botões desabilitados
- 📱 Feedback visual claro

## Endpoints Resumo

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|---------|
| PATCH | `/opportunities/:id/activate` | Ativar oportunidade | 👔 RH (criador) |
| PATCH | `/opportunities/:id/deactivate` | Desativar oportunidade | 👔 RH (criador) |

---

## ✅ Resumo das Funcionalidades

### 🎯 **Funcionalidades Principais**
- ✅ **Ativação individual** de oportunidades
- ✅ **Desativação segura** sem perda de dados
- ✅ **Alternância rápida** de status
- ✅ **Operações em lote** para múltiplas vagas
- ✅ **Controle de visibilidade** para candidatos

### 📱 **Componentes Frontend**
- ✅ **Switch elegante** para ativação/desativação
- ✅ **Botões de ação** com estados de loading
- ✅ **Lista gerenciável** com filtros e seleção
- ✅ **Hook personalizado** para lógica reutilizável
- ✅ **Service completo** com tratamento de erros

### 🔐 **Segurança e UX**
- ✅ **Autenticação robusta** com JWT
- ✅ **Permissões granulares** por proprietário
- ✅ **Feedback visual claro** em todas as operações
- ✅ **Tratamento de erros** amigável
- ✅ **Performance otimizada** com loading states

🚀 **API pronta para integração!** Use os componentes e services acima para implementar o controle completo de ativação de oportunidades no seu frontend React.
