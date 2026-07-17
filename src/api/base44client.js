import { auth as firebaseAuth } from '@/lib/firebase'
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    confirmPasswordReset,
    signOut,
} from 'firebase/auth'

// Wrapper that exposes the methods previously expected from `base44.auth`
const auth = {
    async loginViaEmailPassword(email, password) {
        const res = await signInWithEmailAndPassword(firebaseAuth, email, password)
        return { access_token: res.user?.uid }
    },
    async loginWithProvider(providerName, redirectTo) {
        if (providerName === 'google') {
            const provider = new GoogleAuthProvider()

            // On Android, try popup first - modern Capacitor supports it better than redirect
            const isAndroid = !!(window.Capacitor && window.Capacitor.platform === 'android');

            try {
                const res = await signInWithPopup(firebaseAuth, provider)
                if (redirectTo) window.location.href = redirectTo
                return { access_token: res.user?.uid }
            } catch (err) {
                console.error("Login error:", err.code, err.message);

                const fallbackCodes = [
                    'auth/operation-not-supported-in-this-environment',
                    'auth/operation-not-allowed',
                    'auth/popup-blocked',
                    'auth/internal-error',
                    'auth/invalid-state',
                    'auth/popup-closed-by-user',
                    'auth/cancelled-popup-request'
                ]

                if (fallbackCodes.includes(err.code)) {
                    // Only use redirect as a last resort
                    await signInWithRedirect(firebaseAuth, provider)
                    return null
                }
                throw err
            }
        }
        throw new Error('Provider not supported')
    },
    async handleRedirectResult(redirectTo) {
        try {
            const result = await getRedirectResult(firebaseAuth)
            if (result?.user && redirectTo) {
                window.location.href = redirectTo
            }
            return result?.user ? { access_token: result.user.uid } : null
        } catch (error) {
            return null
        }
    },
    async register({ email, password }) {
        const res = await createUserWithEmailAndPassword(firebaseAuth, email, password)
        // Optionally send verification email here if desired
        return { access_token: res.user?.uid }
    },
    // The original app expected OTP verification; with Firebase we treat verifyOtp as a no-op
    async verifyOtp() {
        return { access_token: firebaseAuth.currentUser?.uid }
    },
    async resendOtp() { return true },
    async resetPasswordRequest(email) {
        await sendPasswordResetEmail(firebaseAuth, email)
        return true
    },
    async resetPassword({ resetToken, newPassword }) {
        await confirmPasswordReset(firebaseAuth, resetToken, newPassword)
        return true
    },
    setToken() { /* no-op; Firebase manages tokens internally */ },
    async me() {
        const user = firebaseAuth.currentUser
        if (!user) throw new Error('Not authenticated')
        return { id: user.uid, email: user.email, displayName: user.displayName }
    },
    async logout() {
        await signOut(firebaseAuth)
        return true
    }
}

export const base44 = { auth }
