import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function Home() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Welcome, {user?.name || user?.email}!
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
              You are now logged into your account.
            </p>
          </motion.div>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={logout}
              className="px-6 py-2 transition-all hover:shadow-md"
              variant="destructive"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
