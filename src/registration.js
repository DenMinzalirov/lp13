import {
  initAppAndGetActiveDomain,
  RegisterPlayer,
  getLinkToNavigate,
  LoginType,
} from 'apuesta-cloud-landing-utils'

const REDIRECTOR_ORIGIN = 'https://htzbtz.cc'
const REDIRECTOR_CAMPAIGN_ID = '686a47af'

const TEXTS = {
  registration: 'Registration',
  login: 'Login',
  emailPlaceholder: 'Enter your email',
  passwordPlaceholder: 'Enter password',
  registerButton: 'Register',
  loginButton: 'Sign in',
  loading: 'Loading...',
  waiting: 'Waiting for data...',
  domainLoading: 'Loading domain data...',
  domainError: 'Error:',
  registrationError: 'Registration error. Please try again later.',
  domainNotLoaded: 'Domain data not loaded. Please try later.',
  registrationSuccess: 'Registration successful!',
  emailError: 'Enter a valid email',
  passwordError: 'Password must contain at least 6 characters',
  termsError: 'You must accept the terms of use',
}

function getUILanguage() {
  return 'en'
}

function getApuestaLanguage() {
  return 'en'
  // if (typeof navigator === 'undefined') return 'en'
  // const locale = (navigator.language || '').toLowerCase()
  // if (locale.startsWith('tr')) return 'tr'
  // if (locale.startsWith('de')) return 'de'
  // return 'en'
}

function runRegistration() {
  const texts = TEXTS

  let domainData = null
  let domainError = null
  let isLoading = true

  const modal = document.getElementById('registration-modal')
  const backdrop = document.getElementById('registration-modal-backdrop')
  const form = document.getElementById('registration-form')
  const submitBtn = document.getElementById('registration-submit-btn')
  const domainErrorEl = document.getElementById('registration-domain-error')
  const submitErrorEl = document.getElementById('registration-submit-error')
  const emailInput = document.getElementById('reg-email')
  const emailErrorEl = document.getElementById('reg-email-error')
  const passwordInput = document.getElementById('reg-password')
  const passwordErrorEl = document.getElementById('reg-password-error')
  const termsCheckbox = document.getElementById('reg-terms')
  const termsErrorEl = document.getElementById('reg-terms-error')
  const passwordToggle = document.getElementById('reg-password-toggle')
  const tabs = document.querySelectorAll('.registration-tab')

  function setSubmitButton(state) {
    if (!submitBtn) return
    if (state === 'loading') {
      submitBtn.disabled = true
      submitBtn.textContent = texts.loading
    } else if (state === 'waiting') {
      submitBtn.disabled = true
      submitBtn.textContent = texts.waiting
    } else if (domainData) {
      submitBtn.disabled = false
      const activeTab = document.querySelector('.registration-tab--active')
      const isSignup = activeTab && activeTab.dataset.tab === 'signup'
      submitBtn.textContent = isSignup ? texts.registerButton : texts.loginButton
    } else {
      submitBtn.disabled = true
      submitBtn.textContent = texts.domainLoading
    }
  }

  function showDomainError(message) {
    if (domainErrorEl) {
      domainErrorEl.textContent = message ? `${texts.domainError} ${message}` : ''
      domainErrorEl.classList.toggle('hidden', !message)
    }
  }

  function showSubmitError(message) {
    if (submitErrorEl) {
      submitErrorEl.textContent = message || ''
      submitErrorEl.classList.toggle('hidden', !message)
    }
  }

  function clearFieldErrors() {
    if (emailErrorEl) emailErrorEl.textContent = ''
    if (passwordErrorEl) passwordErrorEl.textContent = ''
    if (termsErrorEl) termsErrorEl.textContent = ''
    showSubmitError('')
  }

  async function initDomain() {
    try {
      domainData = await initAppAndGetActiveDomain(REDIRECTOR_ORIGIN, REDIRECTOR_CAMPAIGN_ID)
      domainError = null
      showDomainError(null)
    } catch (err) {
      domainData = null
      domainError = err instanceof Error ? err.message : String(err)
      showDomainError(domainError)
    } finally {
      isLoading = false
      setSubmitButton(domainData ? 'ready' : 'waiting')
    }
  }

  function openModal() {
    if (modal) {
      modal.classList.remove('hidden')
      modal.setAttribute('aria-hidden', 'false')
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.add('hidden')
      modal.setAttribute('aria-hidden', 'true')
    }
    clearFieldErrors()
  }

  function validateForm() {
    let valid = true
    const email = emailInput?.value?.trim() || ''
    const password = passwordInput?.value || ''
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (emailErrorEl) emailErrorEl.textContent = ''
    if (passwordErrorEl) passwordErrorEl.textContent = ''
    if (termsErrorEl) termsErrorEl.textContent = ''

    if (!emailRegex.test(email)) {
      if (emailErrorEl) emailErrorEl.textContent = texts.emailError
      valid = false
    }
    if (password.length < 6) {
      if (passwordErrorEl) passwordErrorEl.textContent = texts.passwordError
      valid = false
    }
    if (!termsCheckbox?.checked) {
      if (termsErrorEl) termsErrorEl.textContent = texts.termsError
      valid = false
    }
    return valid
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!domainData) {
      showSubmitError(texts.domainNotLoaded)
      return
    }
    if (!validateForm()) return

    setSubmitButton('loading')
    showSubmitError('')
    clearFieldErrors()

    const registerData = {
      email: emailInput?.value?.trim() || '',
      phone: null,
      password: passwordInput?.value || '',
      currency: 'EUR',
      language: getApuestaLanguage(),
      promoCode: undefined,
      loginType: LoginType.Email,
      region: 'de',
    }

    try {
      const response = await RegisterPlayer(domainData.domain, registerData)
      const linkToNavigate = getLinkToNavigate({
        activeDomainData: domainData,
        refreshToken: response.refresh_token,
      })
      if (linkToNavigate) {
        localStorage.setItem('was-registered', 'true')
        window.location.href = linkToNavigate
      } else {
        alert(texts.registrationSuccess)
        closeModal()
      }
    } catch (err) {
      if (domainData) {
        const errorLink = getLinkToNavigate({
          activeDomainData: domainData,
          isError: true,
        })
        if (errorLink) {
          window.location.href = errorLink
          return
        }
      }
      showSubmitError(texts.registrationError)
      setSubmitButton('ready')
    }
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeModal)
  }

  if (form) {
    form.addEventListener('submit', handleSubmit)
  }

  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
      const type = passwordInput.type
      passwordInput.type = type === 'password' ? 'text' : 'password'
      passwordToggle.textContent = type === 'password' ? '🙈' : '👁️'
      passwordToggle.setAttribute('aria-label', type === 'password' ? 'Hide password' : 'Show password')
    })
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('registration-tab--active'))
      tab.classList.add('registration-tab--active')
      const isSignup = tab.dataset.tab === 'signup'
      if (submitBtn && domainData) {
        submitBtn.textContent = isSignup ? texts.registerButton : texts.loginButton
      }
    })
  })

  const claimBonusBtn = document.querySelector('.scratch-result-cta')
  if (claimBonusBtn) {
    claimBonusBtn.addEventListener('click', openModal)
  }

  setSubmitButton(isLoading ? 'loading' : (domainData ? 'ready' : 'waiting'))
  initDomain()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runRegistration)
} else {
  runRegistration()
}
