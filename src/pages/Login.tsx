import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { auth, token } from '~/lib/api'
import { useAuth } from '~/lib/auth'
import { useTheme } from '~/lib/theme'
import { Button, Input, Field, Card } from '~/components/ui'
import logo from '~/assets/logo.png'
import { cn } from '~/lib/cn'

type Mode = 'login' | 'register'

export default function Login() {
  const nav = useNavigate()
  const { refresh } = useAuth()
  const { theme, toggle } = useTheme()
  const [mode, setMode] = useState<Mode>('login')
  const [step, setStep] = useState<1 | 2>(1)

  const [qq, setQq] = useState('')
  const [name, setName] = useState('')
  const email = qq ? `${qq}@qq.com` : ''
  const [captchaId, setCaptchaId] = useState('')
  const [captchaImg, setCaptchaImg] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [code, setCode] = useState('')

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  const [resendIn, setResendIn] = useState(0)

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

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  function reset(m: Mode) {
    setMode(m)
    setStep(1)
    setErr('')
    setInfo('')
    setCode('')
    setResendIn(0)
    loadCaptcha()
  }

  function backToStep1(infoMsg?: string) {
    setStep(1)
    setCode('')
    setErr('')
    setInfo(infoMsg ?? '')
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
      setInfo(
        mode === 'login'
          ? '如果该邮箱已注册 验证码已发送 请检查邮箱'
          : '验证码已发送 请检查邮箱',
      )
      setStep(2)
      setResendIn(60)
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
      // 后端 5 次失败或过期会返回"已失效" 此时只能回 step 1 重新获取
      if (typeof e.message === 'string' && e.message.includes('失效')) {
        backToStep1('验证码已失效 请重新获取')
      } else {
        setErr(e.message)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <button
        onClick={toggle}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all active:scale-95"
        aria-label="切换主题"
      >
        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Linktofur" width={48} height={48} className="h-12 w-auto mb-3" />
          <h1 className="text-xl font-medium text-gray-900 dark:text-white">Linktofur 控制台</h1>
          <p className="text-sm text-gray-500 mt-1">登录以管理群组和用户</p>
        </div>

        <Card className="p-6">
          <div className="flex gap-2 text-sm mb-6">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => reset(m)}
                className={cn(
                  'flex-1 py-2 rounded-xl transition-all',
                  mode === m
                    ? 'bg-brand-400 text-white'
                    : 'border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:border-brand-400',
                )}
              >
                {m === 'login' ? '登录' : '注册'}
              </button>
            ))}
          </div>

          {step === 1 ? (
            <form onSubmit={submitStep1} className="space-y-4">
              <Field label="QQ号" hint="登录将以 QQ邮箱 接收验证码">
                <div className="relative">
                  <Input
                    required
                    value={qq}
                    onChange={(e) => setQq(e.target.value.replace(/\D/g, ''))}
                    inputMode="numeric"
                    placeholder="123456"
                    className="pr-20 font-mono"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                    @qq.com
                  </span>
                </div>
              </Field>

              {mode === 'register' && (
                <Field label="昵称" required>
                  <Input required value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
              )}

              <Field label="人机验证" required>
                <div className="flex items-center gap-3">
                  <Input
                    required
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="flex-1 text-center font-mono tracking-widest"
                    maxLength={4}
                  />
                  {captchaImg && (
                    <img
                      src={captchaImg}
                      alt="验证码"
                      onClick={loadCaptcha}
                      className="h-11 cursor-pointer rounded-lg border border-gray-200 dark:border-zinc-600"
                      title="点击换一张"
                    />
                  )}
                </div>
              </Field>

              {err && <p className="text-sm text-red-500">{err}</p>}

              <Button busy={busy} type="submit" className="w-full">
                下一步
              </Button>
            </form>
          ) : (
            <form onSubmit={submitStep2} className="space-y-4">
              <Field label="邮箱验证码" hint="8位字母数字 5分钟内有效" required>
                <Input
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  className="text-center font-mono text-lg tracking-widest"
                  maxLength={8}
                  autoComplete="one-time-code"
                  placeholder="如 ABCD2345"
                />
              </Field>

              {info && <p className="text-sm text-green-600 dark:text-green-400">{info}</p>}
              {err && <p className="text-sm text-red-500">{err}</p>}

              <Button busy={busy} type="submit" className="w-full">
                {mode === 'login' ? '登录' : '注册并登录'}
              </Button>

              <button
                type="button"
                disabled={resendIn > 0}
                onClick={() => backToStep1()}
                className="block w-full text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:text-gray-500"
              >
                {resendIn > 0 ? `重新获取验证码 (${resendIn}s)` : '重新获取验证码'}
              </button>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
