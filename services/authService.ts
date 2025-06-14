import { supabase } from "@/utils/supabaseClient"; // or wherever your Supabase client is initialized

type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

type RegisterUserResponse = {
  user: any | null;
  session: any | null;
};

// const redirectTo =
//   typeof window !== "undefined"
//     ? `${window.location.origin}/verify`
//     : undefined;

export async function registerUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
