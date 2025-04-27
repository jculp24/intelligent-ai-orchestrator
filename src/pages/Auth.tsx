import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) throw error;
      toast.success('Check your email for the confirmation link!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  return <div className="container max-w-md mx-auto mt-20">
      <div className="space-y-6 bg-card p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Welcome</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
          </div>
          <div className="space-y-2">
            <Button type="submit" disabled={loading} className="w-full text-zinc-50 bg-blue-700 hover:bg-blue-600">
              {loading ? 'Loading...' : 'Sign In'}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={handleSignUp} disabled={loading}>
              Sign Up
            </Button>
          </div>
        </form>
      </div>
    </div>;
};
export default Auth;