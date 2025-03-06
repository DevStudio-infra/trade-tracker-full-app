"use client";

import { motion } from "framer-motion";

const technologies = [
  {
    category: "Desktop App",
    items: [
      {
        name: "Cross-Platform",
        description: "Available on Windows, macOS, and Linux",
        icon: (
          <svg
            className="size-6"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 5.5L5 7.5M5 7.5L3 9.5M5 7.5H9M15 7.5H19M19 7.5L21 5.5M19 7.5L21 9.5M12 12L12 3M12 12L9 15M12 12L15 15M12 21L12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
      {
        name: "Real-Time Analysis",
        description: "Instant chart pattern recognition",
        icon: (
          <svg
            className="size-6"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 6V4M12 6C15.3137 6 18 8.68629 18 12M12 6C8.68629 6 6 8.68629 6 12M18 12C18 15.3137 15.3137 18 12 18M18 12H20M12 18C8.68629 18 6 15.3137 6 12M12 18V20M6 12H4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
      {
        name: "Offline Support",
        description: "Work without internet connection",
        icon: (
          <svg
            className="size-6"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21M3 12H7M21 12H17M12 21C9.79086 21 8 19.2091 8 17C8 14.7909 9.79086 13 12 13C14.2091 13 16 14.7909 16 17C16 19.2091 14.2091 21 12 21Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
    ],
  },
  {
    category: "Web Platform",
    items: [
      {
        name: "Cloud Sync",
        description: "Access your data from anywhere",
        icon: (
          <svg
            className="size-6"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 12V21M12 21L15 18M12 21L9 18M17 7.34375C17.5978 7.12063 18.2545 7 18.9434 7C21.2346 7 23.0934 8.85875 23.0934 11.15C23.0934 13.4412 21.2346 15.3 18.9434 15.3C18.7258 15.3 18.5127 15.2798 18.3057 15.2411M17 7.34375C17.3156 6.93188 17.5501 6.45193 17.6824 5.92807C18.1411 4.14616 17.1013 2.30275 15.3194 1.84409C13.5375 1.38544 11.6941 2.42518 11.2354 4.20709C11.1031 4.73097 11.0736 5.26563 11.1482 5.78385C9.31755 5.93539 7.86 7.44669 7.86 9.31565C7.86 10.5914 8.53271 11.7166 9.53098 12.3724M17 7.34375C16.6844 7.75563 16.4499 8.23558 16.3176 8.75944C15.8589 10.5414 16.8987 12.3848 18.6806 12.8434C18.557 12.9933 18.421 13.1338 18.2734 13.2634C17.9188 13.5825 17.5007 13.8288 17.0429 13.9842M6.94335 11C4.65217 11 2.79335 12.8588 2.79335 15.15C2.79335 17.4412 4.65217 19.3 6.94335 19.3C7.16099 19.3 7.37405 19.2798 7.58102 19.2411C7.70374 19.091 7.83962 18.9505 7.98717 18.8209C8.34185 18.5018 8.75989 18.2555 9.21773 18.1001C11.0425 17.6253 12.0823 15.7412 11.5807 13.9269C11.4914 13.6177 11.3642 13.3266 11.2048 13.0584C10.0825 13.0196 9.08928 12.5753 8.35382 11.8788C7.91869 11.4733 7.5784 10.9853 7.35645 10.4465C7.22201 10.4816 7.08425 10.5037 6.94335 10.5125"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
      {
        name: "AI Integration",
        description: "Advanced trading insights",
        icon: (
          <svg
            className="size-6"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L12 8M12 8L9 5M12 8L15 5M4 12L8 12M8 12L5 15M8 12L5 9M20 12L16 12M16 12L19 9M16 12L19 15M12 20L12 16M12 16L15 19M12 16L9 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
      {
        name: "Secure Storage",
        description: "End-to-end encrypted data",
        icon: (
          <svg
            className="size-6"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 14.5V16.5M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.61458 11.0736 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.61458 19.9264 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9264 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0736 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
    ],
  },
];

export default function Powered() {
  return (
    <section className="overflow-hidden bg-background py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-urban text-3xl font-bold tracking-tight sm:text-4xl">
            Powered by Modern Technology
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Built with cutting-edge tools to provide a seamless trading
            experience across all platforms.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {technologies.map((tech) => (
            <motion.div
              key={tech.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border bg-card p-8"
            >
              <h3 className="font-urban text-xl font-semibold">
                {tech.category}
              </h3>
              <div className="mt-6 grid gap-6">
                {tech.items.map((item) => (
                  <div key={item.name} className="flex gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
