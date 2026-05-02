const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

const TOKEN_KEY = 'linktofur.token'

export const token = {
  get: () => localStorage.getItem(TOKEN_KEY) || '',
  set: (v: string) => localStorage.setItem(TOKEN_KEY, v),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  code: number
  constructor(code: number, msg: string) {
    super(msg)
    this.code = code
  }
}

export async function req<T = any>(path: string, init?: RequestInit): Promise<T> {
  const t = token.get()
  const headers: Record<string, string> = {
    ...((init?.headers as Record<string, string>) || {}),
  }
  if (t) headers.Authorization = `Bearer ${t}`

  const r = await fetch(base + path, { ...init, headers })
  let data: any = null
  try {
    data = await r.json()
  } catch {}

  const code = data?.code ?? r.status
  if (code === 200) return data.message as T

  const msg =
    data?.message?.message ||
    (typeof data?.message === 'string' && data.message) ||
    `请求失败 ${code}`

  if (code === 401) token.clear()
  throw new ApiError(code, msg)
}

function toForm(body?: Record<string, any>) {
  if (!body) return undefined
  const f = new URLSearchParams()
  Object.entries(body).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') f.set(k, String(v))
  })
  return f
}

const post = <T = any>(p: string, body?: Record<string, any>) =>
  req<T>(p, { method: 'POST', body: toForm(body) })

const get = <T = any>(p: string) => req<T>(p)

// auth

export type Me = {
  id: string
  name: string
  email: string
  level: 'NORMAL' | 'ADMIN'
  banned: string
  verified: string
  createdAt: string
}

export type LoginResult = {
  message: string
  sessionId: string
  name: string
  email: string
  level: 'NORMAL' | 'ADMIN'
}

export const auth = {
  registerStep1: (b: { email: string; name: string; captchaId: string; captchaAnswer: string }) =>
    post<{ message: string }>('/user/register', b),
  registerStep2: (b: { email: string; verifyCode: string }) =>
    post<LoginResult>('/user/register', b),
  loginStep1: (b: { email: string; captchaId: string; captchaAnswer: string }) =>
    post<{ message: string }>('/user/login', b),
  loginStep2: (b: { email: string; token: string }) =>
    post<LoginResult>('/user/login', b),
  logout: () => post('/user/logout'),
  me: () => get<Me>('/user/me'),
  captcha: () => get<{ captchaId: string; image: string }>('/captcha/generate'),
}

// groups

export type Group = {
  id: string
  groupId: string
  groupName: string
  orgName: string
  region: string
  type: 'SCHOOL' | 'REGION'
  joinEntry: string
  userId?: string
  userName?: string
  pending: string
  showContact: string
  acceptApply: string
  hasPendingEdit: string
  createdAt: string
}

type GroupsRaw = { message: string; total: string; groups: string }

const parseGroups = (raw: GroupsRaw): Group[] => JSON.parse(raw.groups)

export const groups = {
  list: async () => {
    const raw = await get<GroupsRaw>('/group/list')
    return { total: Number(raw.total) || 0, groups: parseGroups(raw) }
  },
  add: (b: {
    groupId: string
    groupName: string
    orgName: string
    region: string
    type: 'SCHOOL' | 'REGION'
    joinEntry: string
  }) => post<{ message: string }>('/group/add', b),
  edit: (b: Partial<Group> & { id: string }) => post<{ message: string }>('/group/edit', b),
}

// admin

export type PendingGroup = Group & {
  pendingType: 'new' | 'edit'
  pendingEdit?: Record<string, string>
}

export type AdminUser = {
  id: string
  name: string
  email: string
  level: 'NORMAL' | 'ADMIN'
  banned: string
  verified: string
  createdAt: string
}

type PendingRaw = { message: string; total: string; groups: string }
type UsersRaw = { message: string; total?: string; users: string }

export const admin = {
  pending: async () => {
    const raw = await get<PendingRaw>('/admin/pending')
    return {
      total: Number(raw.total) || 0,
      groups: JSON.parse(raw.groups) as PendingGroup[],
    }
  },
  approve: (id: string) => post('/admin/approve', { id }),
  reject: (id: string, reason?: string) => post('/admin/reject', { id, reason }),
  deleteGroup: (id: string) => post('/admin/deletegroup', { id }),
  userList: async () => {
    const raw = await get<UsersRaw>('/admin/userlist')
    return {
      total: Number(raw.total) || 0,
      users: JSON.parse(raw.users) as AdminUser[],
    }
  },
  userSearch: async (query: string) => {
    const raw = await get<UsersRaw>(`/admin/usersearch?query=${encodeURIComponent(query)}`)
    return JSON.parse(raw.users) as AdminUser[]
  },
  ban: (userId: string) => post('/admin/ban', { userId }),
  unban: (userId: string) => post('/admin/unban', { userId }),
  setAdmin: (userId: string) => post('/admin/setadmin', { userId }),
  addUser: (b: { email: string; name: string }) =>
    post<{ message: string; userId: string; name: string; email: string }>('/admin/adduser', b),
  addGroup: (b: {
    userId: string
    groupId: string
    groupName: string
    orgName: string
    region: string
    type: 'SCHOOL' | 'REGION'
    joinEntry: string
  }) => post<{ message: string }>('/admin/addgroup', b),
}
