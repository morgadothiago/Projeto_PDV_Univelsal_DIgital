'use client'

import { useState } from 'react'
import { UserPlus, X, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/features/users/api/users.api'
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar'
import type { IUser } from '@/features/users/api/users.api'

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function getAvatarStyle(isActive: boolean, index: number) {
  if (!isActive) return { bg: '#F1F5F9', text: '#64748B' }
  const styles = [
    { bg: '#EFF6FF', text: '#2563EB' },
    { bg: '#F0FDF4', text: '#16A34A' },
  ]
  return styles[index % styles.length]
}

interface UserCardProps {
  user: IUser
  index: number
  onDelete: (id: string) => void
  isDeleting: boolean
}

function UserCard({ user, index, onDelete, isDeleting }: UserCardProps) {
  const avatarStyle = getAvatarStyle(user.isActive, index)

  return (
    <div
      className="flex items-center bg-white border rounded-[12px]"
      style={{ padding: '14px 16px', borderColor: '#E2E8F0', gap: '14px', opacity: isDeleting ? 0.5 : 1 }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0 font-bold"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '24px',
          backgroundColor: avatarStyle.bg,
          color: avatarStyle.text,
          fontSize: '16px',
        }}
      >
        {getInitials(user.name)}
      </div>

      <div className="flex flex-col flex-1 min-w-0" style={{ gap: '3px' }}>
        <span className="font-semibold truncate" style={{ fontSize: '14px', color: '#0F172A' }}>
          {user.name}
        </span>
        <span className="truncate" style={{ fontSize: '12px', color: '#64748B' }}>
          {user.email}
        </span>
      </div>

      <div className="flex items-center flex-shrink-0" style={{ gap: '10px' }}>
        <span
          className="font-semibold"
          style={{
            fontSize: '11px',
            height: '22px',
            padding: '0 10px',
            borderRadius: '11px',
            lineHeight: '22px',
            backgroundColor: user.isActive ? '#DCFCE7' : '#FEE2E2',
            color: user.isActive ? '#16A34A' : '#DC2626',
          }}
        >
          {user.isActive ? 'Ativo' : 'Inativo'}
        </span>
        {user.isActive && (
          <button
            onClick={() => onDelete(user.id)}
            disabled={isDeleting}
            aria-label="Desativar caixeiro"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
          >
            <Trash2 size={16} style={{ color: '#DC2626' }} />
          </button>
        )}
      </div>
    </div>
  )
}

interface NovoCaixeiroSheetProps {
  onClose: () => void
}

function NovoCaixeiroSheet({ onClose }: NovoCaixeiroSheetProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { mutate, isPending, error } = useMutation({
    mutationFn: () =>
      usersApi.create({ name: name.trim(), email: email.trim(), password, role: 'cashier' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onClose()
    },
  })

  function handleSubmit() {
    if (!name.trim() || !email.trim() || !password) return
    mutate()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex flex-col bg-white"
        style={{ borderRadius: '16px 16px 0 0', padding: '20px 16px 40px', gap: '16px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-bold" style={{ fontSize: '17px', color: '#0F172A' }}>
            Novo Caixeiro
          </span>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
          >
            <X size={20} style={{ color: '#64748B' }} />
          </button>
        </div>

        {/* Name */}
        <div className="flex flex-col" style={{ gap: '6px' }}>
          <label className="font-medium" style={{ fontSize: '13px', color: '#0F172A' }}>Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome completo"
            className="border outline-none"
            style={{
              height: '48px',
              padding: '0 14px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              borderColor: '#E2E8F0',
              fontSize: '14px',
              color: '#0F172A',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col" style={{ gap: '6px' }}>
          <label className="font-medium" style={{ fontSize: '13px', color: '#0F172A' }}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            className="border outline-none"
            style={{
              height: '48px',
              padding: '0 14px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              borderColor: '#E2E8F0',
              fontSize: '14px',
              color: '#0F172A',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col" style={{ gap: '6px' }}>
          <label className="font-medium" style={{ fontSize: '13px', color: '#0F172A' }}>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha de acesso"
            className="border outline-none"
            style={{
              height: '48px',
              padding: '0 14px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              borderColor: '#E2E8F0',
              fontSize: '14px',
              color: '#0F172A',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <span style={{ fontSize: '13px', color: '#DC2626' }}>
            Erro ao criar caixeiro. Verifique os dados.
          </span>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isPending || !name.trim() || !email.trim() || !password}
          className="font-bold"
          style={{
            height: '52px',
            borderRadius: '12px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            fontSize: '15px',
            border: 'none',
            cursor: isPending || !name.trim() || !email.trim() || !password ? 'not-allowed' : 'pointer',
            opacity: isPending || !name.trim() || !email.trim() || !password ? 0.7 : 1,
          }}
        >
          {isPending ? 'Criando...' : 'Criar Caixeiro'}
        </button>
      </div>
    </div>
  )
}

export default function CaixeirosPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.findAll,
  })

  const { mutate: deleteUser, variables: deletingId } = useMutation({
    mutationFn: (id: string) => usersApi.softDelete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
      <DashboardSidebar />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between bg-white flex-shrink-0"
          style={{ height: '62px', padding: '0 16px', borderBottom: '1px solid #E2E8F0' }}
        >
          <span className="font-bold" style={{ fontSize: '18px', color: '#0F172A' }}>
            Caixeiros
          </span>
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center"
            style={{
              height: '36px',
              padding: '0 14px',
              borderRadius: '8px',
              backgroundColor: '#2563EB',
              border: 'none',
              cursor: 'pointer',
              gap: '6px',
            }}
          >
            <UserPlus size={16} style={{ color: '#FFFFFF' }} />
            <span className="font-semibold" style={{ fontSize: '13px', color: '#FFFFFF' }}>
              Novo
            </span>
          </button>
        </header>

        {/* Content */}
        <div
          className="flex flex-col overflow-y-auto flex-1 pb-16 md:pb-0"
          style={{ gap: '10px', padding: '12px 16px' }}
        >
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-[12px]"
                style={{ height: '76px', backgroundColor: '#E2E8F0' }}
              />
            ))
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center" style={{ paddingTop: '40px' }}>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>
                Nenhum caixeiro cadastrado
              </span>
            </div>
          ) : (
            users.map((user, index) => (
              <UserCard
                key={user.id}
                user={user}
                index={index}
                onDelete={deleteUser}
                isDeleting={deletingId === user.id}
              />
            ))
          )}
        </div>
      </div>

      {sheetOpen && <NovoCaixeiroSheet onClose={() => setSheetOpen(false)} />}
    </div>
  )
}
