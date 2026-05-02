import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, token } from '~/lib/api'
import { useAuth } from '~/lib/auth'

type Mode = 'login' | 'register'
type Step = 1 | 2

export default function Login() {
  const nav = useNavigate()
  const { refresh } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [step, setStep] = useState<Step>(1)

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [captchaId, setCaptchaId] = useState('')
  const [captchaImg, setCaptchaImg] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [code, setCode] = useState('')

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')

  async function loadCaptcha() {
    try {
      const c = await auth.captcha()
      setCaptchaId(c.captchaId)
      setCaptchaImg(c.image)
      setCaptchaAnswer('')
    } catch (e: any) {
      setErr(e.message)
    }
  }

  useEffect(() => {
    loadCaptcha()
  }, [])

  function reset(m: Mode) {
    setMode(m)
    setStep(1)
    setErr('')
    setInfo('')
    setCode('')
    loadCaptcha()
  }

  async function submitStep1(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    setInfo('')
    try {
      if (mode === 'login') {
        await auth.loginStep1({ email, captchaId, captchaAnswer })
      } else {
        await auth.registerStep1({ email, name, captchaId, captchaAnswer })
      }
      setInfo('验证码已发送到邮箱')
      setStep(2)
    } catch (e: any) {
      setErr(e.message)
      loadCaptcha()
    } finally {
      setBusy(false)
    }
  }

  async function submitStep2(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      const r =
        mode === 'login'
          ? await auth.loginStep2({ email, token: code })
          : await auth.registerStep2({ email, verifyCode: code })
      token.set(r.sessionId)
      await refresh()
      nav('/dashboard', { replace: true })
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Linktofur 控制台</h1>

        <div className="mt-4 flex gap-2 text-sm">
          <button
            onClick={() => reset('login')}
            className={tab(mode === 'login')}
          >
            登录
          </button>
          <button
            onClick={() => reset('register')}
            className={tab(mode === 'register')}
          >
            注册
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={submitStep1} className="mt-6 space-y-4">
            <Field label="邮箱 仅支持 qq.com">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={input}
              />
            </Field>

            {mode === 'register' && (
              <Field label="昵称">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={input}
                />
              </Field>
            )}

            <Field label="验证码">
              <div className="flex items-end gap-2">
                <input
                  required
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className={input + ' flex-1'}
                />
                {captchaImg && (
                  <img
                    src={captchaImg}
                    alt="captcha"
                    onClick={loadCaptcha}
                    className="h-10 cursor-pointer rounded border border-neutral-300"
                    title="点击换一张"
                  />
                )}
              </div>
            </Field>

            {err && <Msg color="red">{err}</Msg>}

            <button disabled={busy} className={btn}>
              {busy ? '请稍候' : '下一步'}
            </button>
          </form>
        ) : (
          <form onSubmit={submitStep2} className="mt-6 space-y-4">
            <Field label="邮箱验证码">
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={input}
              />
            </Field>

            {info && <Msg color="green">{info}</Msg>}
            {err && <Msg color="red">{err}</Msg>}

            <button disabled={busy} className={btn}>
              {busy ? '请稍候' : mode === 'login' ? '登录' : '注册并登录'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-neutral-500 hover:text-black"
            >
              返回上一步
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const input =
  'w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-black'

const btn =
  'w-full rounded-md bg-black text-white py-2.5 hover:bg-neutral-800 disabled:opacity-60'

const tab = (active: boolean) =>
  active
    ? 'flex-1 py-2 rounded-md bg-black text-white'
    : 'flex-1 py-2 rounded-md border border-neutral-300 hover:border-black'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-neutral-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function Msg({ children, color }: { children: React.ReactNode; color: 'red' | 'green' }) {
  const cls = color === 'red' ? 'text-red-600' : 'text-green-700'
  return <div className={`text-sm ${cls}`}>{children}</div>
}
