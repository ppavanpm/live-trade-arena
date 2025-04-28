
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { registerUser } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: FormData) => {
    setIsLoading(true);
    try {
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      });

      if (error) throw error;

      // Send welcome email using the edge function
      await fetch('https://anumypiphyebzquhveby.supabase.co/functions/v1/send-welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.fullName,
          email: values.email,
        }),
      });

      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during signup');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-trading-bg-tertiary/30 bg-trading-bg-secondary">
      <CardHeader>
        <CardTitle className="text-2xl text-trading-text-primary">Create an Account</CardTitle>
        <CardDescription className="text-trading-text-secondary">
          Sign up to start trading today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-trading-text-primary">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="John Doe"
                      {...field}
                      className="bg-trading-bg-tertiary/30 border-trading-bg-tertiary text-trading-text-primary focus:border-trading-accent-blue"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-trading-text-primary">Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="john@example.com"
                      type="email"
                      {...field}
                      className="bg-trading-bg-tertiary/30 border-trading-bg-tertiary text-trading-text-primary focus:border-trading-accent-blue"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-trading-text-primary">Password</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="******"
                      type="password"
                      {...field}
                      className="bg-trading-bg-tertiary/30 border-trading-bg-tertiary text-trading-text-primary focus:border-trading-accent-blue"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-trading-text-primary">Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="******"
                      type="password"
                      {...field}
                      className="bg-trading-bg-tertiary/30 border-trading-bg-tertiary text-trading-text-primary focus:border-trading-accent-blue"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-trading-accent-blue hover:bg-trading-accent-blue/90"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 border-t border-trading-bg-tertiary/30 pt-4">
        <div className="text-sm text-trading-text-secondary text-center">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </div>
      </CardFooter>
    </Card>
  );
};

export default SignupForm;
