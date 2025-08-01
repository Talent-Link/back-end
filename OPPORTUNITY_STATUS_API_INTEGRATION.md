# 🔄 API de Ativação/Desativação de Oportunidades - TalentLink

## Visão Geral

A API de gerenciamento de status de oportunidades permite que usuários RH controlem a disponibilidade de suas vagas:

- ✅ **Ativar oportunidade**: Tornar uma vaga visível e disponível para candidatos
- ✅ **Desativar oportunidade**: Ocultar uma vaga sem deletá-la (permite reativação)
- ✅ **Controle de status**: Gerenciar o campo `isActive` de cada oportunidade
- ✅ **Histórico preservado**: Vagas desativadas mantêm dados e candidaturas

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
  isActive: boolean;             // ⭐ STATUS DA OPORTUNIDADE
  createdAt: Date;              // Data de criação
  company: Company;             // Dados da empresa
  form?: Form;                  // Formulário associado (opcional)
  responses: Response[];        // Candidaturas recebidas
}
```

### Status da Oportunidade
```typescript
type OpportunityStatus = {
  isActive: boolean;  // true = ativa | false = desativada
};
```

## Endpoints Disponíveis

### 🟢 **Ativar Oportunidade**

#### PATCH /opportunities/{id}/activate
```http
PATCH /opportunities/{id}/activate
Authorization: Bearer <token_jwt_rh>
Content-Type: application/json
```

**Descrição:** Ativa uma oportunidade, tornando-a visível para candidatos.

**Parâmetros:**
- `id` (path): ID da oportunidade a ser ativada

**Resposta de Sucesso (200):**
```json
"Oportunidade ativada com sucesso."
```

**Respostas de Erro:**
```json
// 401 - Não autenticado
"Usuário não autenticado."

// 403 - Sem permissão (não é RH)
"Acesso restrito a RH."

// 403 - Oportunidade não pertence ao RH
"Sem permissão para ativar esta oportunidade."

// 404 - Oportunidade não encontrada
"Oportunidade não encontrada."

// 500 - Erro interno
"Erro interno ao ativar oportunidade."
```

### 🔴 **Desativar Oportunidade**

#### PATCH /opportunities/{id}/deactivate
```http
PATCH /opportunities/{id}/deactivate
Authorization: Bearer <token_jwt_rh>
Content-Type: application/json
```

**Descrição:** Desativa uma oportunidade, ocultando-a dos candidatos sem deletar.

**Parâmetros:**
- `id` (path): ID da oportunidade a ser desativada

**Resposta de Sucesso (200):**
```json
"Oportunidade desativada com sucesso."
```

**Respostas de Erro:**
```json
// 401 - Não autenticado
"Usuário não autenticado."

// 403 - Sem permissão (não é RH)
"Acesso restrito a RH."

// 403 - Oportunidade não pertence ao RH
"Sem permissão para desativar esta oportunidade."

// 404 - Oportunidade não encontrada
"Oportunidade não encontrada."

// 500 - Erro interno
"Erro interno ao desativar oportunidade."
```

## Códigos de Status

- ✅ **200** - Sucesso na ativação/desativação
- 🔒 **401** - Token de autenticação inválido
- 🚫 **403** - Acesso negado (apenas RH proprietário pode modificar)
- ❓ **404** - Oportunidade não encontrada
- 💥 **500** - Erro interno do servidor

## Regras de Negócio

### Acesso e Permissões
- ⚠️ Apenas usuários com `userType: "RH"` podem ativar/desativar oportunidades
- 🔐 Autenticação JWT obrigatória
- 🎯 RH só pode gerenciar oportunidades de suas próprias empresas

### Comportamento do Sistema
- 🟢 **Oportunidades ativas** (`isActive: true`): Visíveis para candidatos
- 🔴 **Oportunidades desativadas** (`isActive: false`): Ocultas dos candidatos
- 📊 **Dados preservados**: Desativar não deleta candidaturas existentes
- 🔄 **Reativação**: Oportunidades podem ser ativadas/desativadas múltiplas vezes

## Integração Frontend

### Service para Gerenciamento de Status

```typescript
// opportunityStatusService.ts
const API_BASE_URL = 'https://talentlink-wd88.onrender.com';

interface OpportunityStatusResponse {
  message: string;
}

export const opportunityStatusService = {
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

  // Toggle status da oportunidade
  async toggleOpportunityStatus(opportunityId: string, currentStatus: boolean): Promise<string> {
    if (currentStatus) {
      return await this.deactivateOpportunity(opportunityId);
    } else {
      return await this.activateOpportunity(opportunityId);
    }
  },

  // Verificar status da oportunidade (via API de detalhes)
  async getOpportunityStatus(opportunityId: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar status da oportunidade');
      }

      const opportunity = await response.json();
      return opportunity.isActive;
    } catch (error) {
      console.error('Erro ao verificar status da oportunidade:', error);
      return false;
    }
  }
};

export type { OpportunityStatusResponse };
```

### Componente React - Toggle de Status

```tsx
// OpportunityStatusToggle.tsx
import React, { useState } from 'react';
import { opportunityStatusService } from '../services/opportunityStatusService';

interface OpportunityStatusToggleProps {
  opportunityId: string;
  initialStatus: boolean;
  onStatusChange?: (newStatus: boolean) => void;
}

const OpportunityStatusToggle: React.FC<OpportunityStatusToggleProps> = ({
  opportunityId,
  initialStatus,
  onStatusChange
}) => {
  const [isActive, setIsActive] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleToggleStatus = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await opportunityStatusService.toggleOpportunityStatus(
        opportunityId, 
        isActive
      );

      const newStatus = !isActive;
      setIsActive(newStatus);
      
      if (onStatusChange) {
        onStatusChange(newStatus);
      }

      console.log('Status alterado:', result);
    } catch (err) {
      setError(err.message || 'Erro ao alterar status da oportunidade');
      console.error('Erro no toggle:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Toggle Switch */}
      <button
        onClick={handleToggleStatus}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isActive 
            ? 'bg-green-600' 
            : 'bg-gray-200'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isActive ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>

      {/* Status Label */}
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {isActive ? '🟢 Ativa' : '🔴 Desativada'}
        </span>

        {loading && (
          <div className="inline-flex items-center text-sm text-gray-500">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Alterando...
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default OpportunityStatusToggle;
```

### Componente React - Lista de Oportunidades com Status

```tsx
// OpportunityListWithStatus.tsx
import React, { useState, useEffect } from 'react';
import { opportunityStatusService } from '../services/opportunityStatusService';
import OpportunityStatusToggle from './OpportunityStatusToggle';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  isActive: boolean;
  createdAt: string;
  company: {
    name: string;
    address: string;
  };
}

const OpportunityListWithStatus: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Buscar oportunidades do RH logado
      const response = await fetch('https://talentlink-wd88.onrender.com/opportunities', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar oportunidades');
      }

      const data = await response.json();
      setOpportunities(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar oportunidades');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (opportunityId: string, newStatus: boolean) => {
    setOpportunities(prev => 
      prev.map(opp => 
        opp.id === opportunityId 
          ? { ...opp, isActive: newStatus }
          : opp
      )
    );
  };

  if (loading) return <div className="text-center p-4">Carregando oportunidades...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Oportunidades</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtros de Status */}
      <div className="mb-6 flex space-x-4">
        <button className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
          🟢 Ativas ({opportunities.filter(op => op.isActive).length})
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium">
          🔴 Desativadas ({opportunities.filter(op => !op.isActive).length})
        </button>
        <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
          📊 Total ({opportunities.length})
        </button>
      </div>

      {/* Lista de Oportunidades */}
      <div className="space-y-4">
        {opportunities.map((opportunity) => (
          <div 
            key={opportunity.id} 
            className={`bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 ${
              opportunity.isActive ? 'border-green-400' : 'border-gray-400'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {opportunity.title}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    opportunity.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {opportunity.isActive ? '🟢 Ativa' : '🔴 Desativada'}
                  </span>
                </div>

                <p className="text-gray-600 mb-2">{opportunity.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>📍 {opportunity.location}</span>
                  <span>🏢 {opportunity.company.name}</span>
                  <span>📅 {new Date(opportunity.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="ml-6">
                <OpportunityStatusToggle
                  opportunityId={opportunity.id}
                  initialStatus={opportunity.isActive}
                  onStatusChange={(newStatus) => handleStatusChange(opportunity.id, newStatus)}
                />
              </div>
            </div>

            {/* Ações */}
            <div className="mt-4 flex space-x-2 pt-4 border-t border-gray-200">
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm">
                ✏️ Editar
              </button>
              <button className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm">
                👁️ Ver Candidatos
              </button>
              <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm">
                🗑️ Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {opportunities.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">
            Nenhuma oportunidade cadastrada
          </h2>
          <p className="text-gray-500">
            Comece criando sua primeira vaga para atrair candidatos.
          </p>
        </div>
      )}
    </div>
  );
};

export default OpportunityListWithStatus;
```

### Hook Personalizado para Status de Oportunidades

```tsx
// useOpportunityStatus.ts
import { useState, useCallback } from 'react';
import { opportunityStatusService } from '../services/opportunityStatusService';

export const useOpportunityStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activateOpportunity = useCallback(async (opportunityId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await opportunityStatusService.activateOpportunity(opportunityId);
      return result;
    } catch (err) {
      setError(err.message || 'Erro ao ativar oportunidade');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivateOpportunity = useCallback(async (opportunityId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await opportunityStatusService.deactivateOpportunity(opportunityId);
      return result;
    } catch (err) {
      setError(err.message || 'Erro ao desativar oportunidade');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleOpportunityStatus = useCallback(async (opportunityId: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const result = await opportunityStatusService.toggleOpportunityStatus(opportunityId, currentStatus);
      return !currentStatus; // Retorna o novo status
    } catch (err) {
      setError(err.message || 'Erro ao alterar status da oportunidade');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOpportunityStatus = useCallback(async (opportunityId: string) => {
    try {
      setLoading(true);
      setError(null);
      const status = await opportunityStatusService.getOpportunityStatus(opportunityId);
      return status;
    } catch (err) {
      setError(err.message || 'Erro ao verificar status da oportunidade');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    activateOpportunity,
    deactivateOpportunity,
    toggleOpportunityStatus,
    getOpportunityStatus,
    clearError: () => setError(null)
  };
};
```

### Componente React - Botões de Ação Rápida

```tsx
// QuickStatusButtons.tsx
import React from 'react';
import { useOpportunityStatus } from '../hooks/useOpportunityStatus';

interface QuickStatusButtonsProps {
  opportunityId: string;
  currentStatus: boolean;
  onStatusChange?: (newStatus: boolean) => void;
}

const QuickStatusButtons: React.FC<QuickStatusButtonsProps> = ({
  opportunityId,
  currentStatus,
  onStatusChange
}) => {
  const { loading, error, activateOpportunity, deactivateOpportunity } = useOpportunityStatus();

  const handleActivate = async () => {
    try {
      await activateOpportunity(opportunityId);
      if (onStatusChange) {
        onStatusChange(true);
      }
    } catch (err) {
      console.error('Erro ao ativar:', err);
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateOpportunity(opportunityId);
      if (onStatusChange) {
        onStatusChange(false);
      }
    } catch (err) {
      console.error('Erro ao desativar:', err);
    }
  };

  return (
    <div className="flex space-x-2">
      {!currentStatus ? (
        <button
          onClick={handleActivate}
          disabled={loading}
          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳' : '🟢'} Ativar
        </button>
      ) : (
        <button
          onClick={handleDeactivate}
          disabled={loading}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳' : '🔴'} Desativar
        </button>
      )}

      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
    </div>
  );
};

export default QuickStatusButtons;
```

## Fluxo de Uso

### 1. **RH faz login e acessa painel**
```typescript
const { activateOpportunity, deactivateOpportunity } = useOpportunityStatus();
```

### 2. **RH visualiza lista de oportunidades**
```http
GET /opportunities
```

### 3. **RH desativa uma oportunidade**
```http
PATCH /opportunities/{id}/deactivate
```

### 4. **RH reativa a oportunidade**
```http
PATCH /opportunities/{id}/activate
```

### 5. **Sistema atualiza interface em tempo real**
```typescript
onStatusChange={(newStatus) => updateOpportunityList(id, newStatus)}
```

## Casos de Uso

### ✅ Gerenciamento de Vagas Ativas
1. RH cria nova oportunidade (ativa por padrão)
2. Oportunidade aparece para candidatos
3. RH pode desativar temporariamente
4. RH pode reativar quando necessário

### ✅ Controle de Visibilidade
1. RH desativa vagas que estão com muitos candidatos
2. RH ativa vagas que precisam de mais candidatos
3. RH mantém histórico sem deletar dados

### ✅ Gestão Estratégica
1. RH analisa performance de cada vaga
2. Desativa vagas com baixo interesse
3. Foca recursos em vagas mais promissoras
4. Reativa vagas em momentos específicos

## Benefícios

### 🎯 **Para o RH**
- ✅ **Controle total** sobre visibilidade das vagas
- ✅ **Flexibilidade** para pausar/retomar recrutamento
- ✅ **Dados preservados** mesmo com vaga desativada
- ✅ **Interface intuitiva** com toggle visual

### 📊 **Para o Sistema**
- ✅ **Performance otimizada** (candidatos não veem vagas inativas)
- ✅ **Histórico completo** de todas as candidaturas
- ✅ **Controle granular** por oportunidade
- ✅ **Auditoria completa** de ações realizadas

## Segurança

- 🔐 **JWT Token obrigatório** em todas as operações
- 🎯 **Role-based access**: Apenas RH pode gerenciar status
- 🔗 **Isolamento de dados**: RH só gerencia suas próprias vagas
- 🛡️ **Validação de propriedade**: Sistema verifica se oportunidade pertence ao RH

## Endpoints Resumo

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|---------|
| PATCH | `/opportunities/:id/activate` | Ativar oportunidade | 👔 RH Proprietário |
| PATCH | `/opportunities/:id/deactivate` | Desativar oportunidade | 👔 RH Proprietário |

---

## ✅ Resumo das Funcionalidades

### 🎯 **Funcionalidades Principais**
- ✅ **Toggle de status** com interface visual intuitiva
- ✅ **Ativação/Desativação** via endpoints específicos
- ✅ **Controle granular** por oportunidade individual
- ✅ **Preservação de dados** durante desativação

### 📱 **Frontend Completo**
- ✅ **Service dedicado** para gerenciamento de status
- ✅ **Componentes React** prontos para uso
- ✅ **Hook personalizado** para lógica de estado
- ✅ **Interface responsiva** com feedback visual
- ✅ **Tratamento completo** de erros e loading

### 🔐 **Segurança e Performance**
- ✅ **Autenticação JWT** obrigatória
- ✅ **Validação de propriedade** de oportunidades
- ✅ **Controle de acesso** baseado em roles
- ✅ **Otimização de performance** para candidatos

🚀 **API pronta para integração!** Use os exemplos acima para implementar o controle completo de status de oportunidades no seu frontend.
