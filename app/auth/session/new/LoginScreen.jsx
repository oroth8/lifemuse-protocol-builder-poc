"use client";

import Image from "next/image";
import { usePrototypeAuth } from "../../../components/PrototypeAuthProvider";

const controlRadius = "rounded-[10px]";

export function LoginScreen() {
  const { login } = usePrototypeAuth();

  const inputClass =
    `w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400 ${controlRadius}`;

  return (
    <div className="grid min-h-dvh min-w-0 grid-cols-1 bg-white lg:min-h-screen lg:grid-cols-2">
      {/* Left: centered form block + forgot pinned toward bottom */}
      <section className="flex min-h-dvh min-w-0 flex-col bg-white lg:min-h-screen">
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-10 sm:px-12 lg:px-14">
          <div className="w-full max-w-md">
            <div className="w-fit">
              <Image
                src="/auth/login-wordmark-horizontal.png"
                alt="LIFEMUSE"
                width={143}
                height={17}
                className="h-7 w-auto max-w-[min(100%,280px)] object-contain object-left sm:h-8"
                priority
              />
            </div>

            <h1 className="mt-8 text-left text-[1.65rem] font-bold leading-tight tracking-tight text-neutral-800 sm:mt-10 sm:text-3xl">Log In</h1>
            <p className="mt-2 text-left text-sm leading-relaxed text-neutral-500 sm:text-[0.9375rem]">
              Welcome Back to LifeMuse Corporate Portal.
            </p>

            <form className="mt-8 flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              <label className="block text-left">
                <span className="mb-2 block text-sm font-medium text-neutral-800">Email</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  className={inputClass}
                />
              </label>
              <label className="block text-left">
                <span className="mb-2 block text-sm font-medium text-neutral-800">Password</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={inputClass}
                />
              </label>

              <button
                type="button"
                onClick={login}
                className={`mt-1 w-full bg-[#2d2d2d] py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#3a3a3a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d2d2d] sm:text-base ${controlRadius}`}
              >
                Log In
              </button>
            </form>
          </div>
        </div>

        <div className="shrink-0 px-8 pb-8 pt-2 sm:px-12 lg:px-14">
          <div className="mx-auto w-full max-w-md">
            <button
              type="button"
              className="text-left text-sm text-neutral-800 underline decoration-neutral-800 underline-offset-2 hover:text-neutral-950"
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </section>

      {/* Right: texture + logo (smaller mark) */}
      <section
        className="relative flex min-h-[min(42vh,360px)] min-w-0 items-center justify-center lg:min-h-dvh"
        style={{
          backgroundImage: "url(/auth/login-texture-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-[1] flex w-full flex-col items-center justify-center px-8 py-12">
          <Image
            src="/auth/login-logo-mark-and-wordmark.png"
            alt="LIFEMUSE"
            width={144}
            height={181}
            className="h-auto w-[min(42vw,120px)] max-w-[130px] object-contain sm:max-w-[140px]"
            priority
          />
        </div>
      </section>
    </div>
  );
}
