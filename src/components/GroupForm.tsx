import { useState } from 'react'

export type GroupFormValue = {
  groupId: string
  groupName: string
  orgName: string
  region: string
  type: 'SCHOOL' | 'REGION'
  joinEntry: string
  showContact?: string
  acceptApply?: string
}

type Props = {
  initial?: Partial<GroupFormValue & { showContact: boolean; acceptApply: boolean }>
  onSubmit: (v: GroupFormValue) => void
  busy?: boolean
  err?: string
  submitLabel: string
  showFlags?: boolean
}

export default function GroupForm({ initial, onSubmit, busy, err, submitLabel, showFlags }: Props) {
  const [groupId, setGroupId] = useState(initial?.groupId || '')
  const [groupName, setGroupName] = useState(initial?.groupName || '')
  const [orgName, setOrgName] = useState(initial?.orgName || '')
  const [region, setRegion] = useState(initial?.region || '')
  const [type, setType] = useState<'SCHOOL' | 'REGION'>(initial?.type || 'SCHOOL')
  const [joinEntry, setJoinEntry] = useState(initial?.joinEntry || '')
  const [showContact, setShowContact] = useState(initial?.showContact ?? false)
  const [acceptApply, setAcceptApply] = useState(initial?.acceptApply ?? true)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const v: GroupFormValue = { groupId, groupName, orgName, region, type, joinEntry }
    if (showFlags) {
      v.showContact = String(showContact)
      v.acceptApply = String(acceptApply)
    }
    onSubmit(v)
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
      <Field label="群类型">
        <select value={type} onChange={(e) => setType(e.target.value as any)} className={input}>
          <option value="SCHOOL">学校群</option>
          <option value="REGION">地区群</option>
        </select>
      </Field>

      <Field label="群名">
        <input required value={groupName} onChange={(e) => setGroupName(e.target.value)} className={input} />
      </Field>

      <Field label="QQ 群号">
        <input required value={groupId} onChange={(e) => setGroupId(e.target.value)} className={input} />
      </Field>

      <Field label={type === 'SCHOOL' ? '学校名' : '组织名'}>
        <input required value={orgName} onChange={(e) => setOrgName(e.target.value)} className={input} />
      </Field>

      <Field label="地区">
        <input required value={region} onChange={(e) => setRegion(e.target.value)} className={input} />
      </Field>

      <Field label="入群方式 链接或暗号等">
        <input required value={joinEntry} onChange={(e) => setJoinEntry(e.target.value)} className={input} />
      </Field>

      {showFlags && (
        <div className="space-y-2 pt-2">
          <Toggle checked={showContact} onChange={setShowContact} label="公开联系方式" />
          <Toggle checked={acceptApply} onChange={setAcceptApply} label="接受用户申请" />
        </div>
      )}

      {err && <div className="text-sm text-red-600">{err}</div>}

      <button disabled={busy} className="rounded-md bg-black text-white px-5 py-2.5 hover:bg-neutral-800 disabled:opacity-60">
        {busy ? '请稍候' : submitLabel}
      </button>
    </form>
  )
}

const input = 'w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-black'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-neutral-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}
