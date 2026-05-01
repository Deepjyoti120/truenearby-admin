import Image from "next/image"

import { LoginForm } from "@/components/login-form"
import { APP_LOGO, APP_NAME, APP_TAGLINE } from "@/lib/constants"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <span className="flex items-center gap-2 font-medium">
            <Image
              src={APP_LOGO}
              alt={`${APP_NAME} logo`}
              width={32}
              height={32}
              className="size-8"
              priority
            />
            {APP_NAME}
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-pink-50 lg:block">
        <Image
          src="/brand/login/bg.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <Image
          src="/brand/login/cloud.png"
          alt=""
          width={220}
          height={120}
          className="absolute top-8 left-10 opacity-90"
          aria-hidden
        />
        <Image
          src="/brand/login/cloud.png"
          alt=""
          width={160}
          height={90}
          className="absolute top-24 right-12 opacity-80"
          aria-hidden
        />
        <Image
          src="/brand/login/leaf-back.png"
          alt=""
          width={260}
          height={260}
          className="absolute -top-6 -right-10 opacity-70"
          aria-hidden
        />
        <Image
          src="/brand/login/balloons_love.png"
          alt=""
          width={420}
          height={420}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] drop-shadow-xl"
          priority
        />
        <Image
          src="/brand/login/flower_left.png"
          alt=""
          width={220}
          height={220}
          className="absolute -bottom-4 -left-6"
          aria-hidden
        />
        <Image
          src="/brand/login/flowers.png"
          alt=""
          width={260}
          height={260}
          className="absolute -bottom-6 -right-6"
          aria-hidden
        />
        <Image
          src="/brand/login/leaf.png"
          alt=""
          width={140}
          height={140}
          className="absolute bottom-10 left-1/3"
          aria-hidden
        />
        <Image
          src="/brand/login/flower.png"
          alt=""
          width={120}
          height={120}
          className="absolute top-1/3 right-8"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-10 z-10 flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground drop-shadow">
            {APP_NAME}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{APP_TAGLINE}</p>
        </div>
      </div>
    </div>
  )
}
