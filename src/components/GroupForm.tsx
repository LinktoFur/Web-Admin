import { useState } from 'react'
import { Switch } from '@headlessui/react'
import { Button, Input, Select, Field, Card } from '~/components/ui'
import { cn } from '~/lib/cn'

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
    <Card className="p-5">
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="群类型" required>
            <Select value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="SCHOOL">院校群</option>
              <option value="REGION">地区联合群</option>
            </Select>
          </Field>

          <Field label="QQ 群号" required>
            <Input
              required
              value={groupId}
              onChange={(e) => setGroupId(e.target.value.replace(/\D/g, ''))}
              inputMode="numeric"
            />
          </Field>

          <Field label="群名" required>
            <Input
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={type === 'SCHOOL' ? '广东XX大学Furry社' : '广东地区联合群'}
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
        </div>

        {showFlags && (
          <div className="pt-3 border-t border-gray-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ToggleRow
              checked={showContact}
              onChange={(v) => {
                setShowContact(v)
                if (v) setAcceptApply(false)
              }}
              label="公开联系方式"
              hint="网站直接展示入群方式"
            />
            <ToggleRow
              checked={acceptApply}
              onChange={(v) => {
                setAcceptApply(v)
                if (v) setShowContact(false)
              }}
              label="接收网站申请"
              hint="允许用户站内申请加群"
            />
          </div>
        )}

        {err && <p className="text-sm text-red-500">{err}</p>}

        <div className="pt-1">
          <Button busy={busy} type="submit">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  )
}

function ToggleRow({
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
    <div className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 dark:border-white/5 px-3 py-2.5">
      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</div>
        {hint && <div className="text-xs text-gray-500 mt-0.5">{hint}</div>}
      </div>
      <Switch
        checked={checked}
        onChange={onChange}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-300 mt-0.5',
          checked ? 'bg-brand-400' : 'bg-gray-300 dark:bg-zinc-600',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5',
          )}
        />
      </Switch>
    </div>
  )
}
