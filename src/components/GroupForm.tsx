import { useState } from 'react'
import { Button, Input, Select, Field, Card } from '~/components/ui'

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
    <Card className="p-6">
      <form onSubmit={submit} className="space-y-4">
        <Field label="群类型" required>
          <Select value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="SCHOOL">院校群</option>
            <option value="REGION">地区联合群</option>
          </Select>
        </Field>

        <Field label="群名" required>
          <Input
            required
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder={type === 'SCHOOL' ? '广东XX大学Furry社' : '广东地区联合群'}
          />
        </Field>

        <Field label="QQ 群号" required>
          <Input
            required
            value={groupId}
            onChange={(e) => setGroupId(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
          />
        </Field>

        <Field label={type === 'SCHOOL' ? '学校名' : '组织名'} required>
          <Input
            required
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder={type === 'SCHOOL' ? '广东XX大学' : 'XX联合社'}
          />
        </Field>

        <Field label="地区" required>
          <Input required value={region} onChange={(e) => setRegion(e.target.value)} placeholder="广东 / 四川 / 日本" />
        </Field>

        <Field label="入群方式" required hint="链接 暗号或问卷">
          <Input required value={joinEntry} onChange={(e) => setJoinEntry(e.target.value)} />
        </Field>

        {showFlags && (
          <div className="pt-2 space-y-3 border-t border-gray-100 dark:border-white/5">
            <Toggle
              checked={showContact}
              onChange={setShowContact}
              label="公开联系方式"
              hint="开启后网站直接展示你的入群方式"
            />
            <Toggle
              checked={acceptApply}
              onChange={setAcceptApply}
              label="接收网站申请"
              hint="关闭后用户无法通过网站申请加群"
            />
          </div>
        )}

        {err && <p className="text-sm text-red-500">{err}</p>}

        <Button busy={busy} type="submit">
          {submitLabel}
        </Button>
      </form>
    </Card>
  )
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-400 focus:ring-brand-400/30"
      />
      <div className="text-sm">
        <div className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-brand-400 transition-colors">
          {label}
        </div>
        {hint && <div className="text-xs text-gray-500 mt-0.5">{hint}</div>}
      </div>
    </label>
  )
}
