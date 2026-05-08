import React, { useState } from "react";
import { useSubmitFormMutation } from "../slices/formApiSlice";
import { toast } from "react-toastify";
import { FaLocationDot, FaEnvelope, FaPhone } from "react-icons/fa6";

const Getintouch = () => {
  const [submitForm, { isLoading }] = useSubmitFormMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await submitForm({
        formType: 'getintouch',
        formName: 'Get In Touch Form',
        submittedFrom: 'Get In Touch Section',
        pageUrl: window.location.pathname,
        contactInfo: {
          name: name,
          email: email
        },
        formData: {
          subject: subject,
          message: message
        }
      }).unwrap();
      
      toast.success("Message Sent Successfully");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send message");
    }
  };

  const contactInfo = [
    {
      label: "Office",
      value: "3, Amode Close, Ikeja, Lagos, Nigeria.",
      icon: <FaLocationDot className="w-5 h-5" />,
    },
    {
      label: "Email",
      value: "growth@lovohcreate.com",
      icon: <FaEnvelope className="w-5 h-5" />,
    },
    {
      label: "Phone",
      value: "+2347059585905",
      icon: <FaPhone className="w-5 h-5" />,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#f8fafc] py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header - Centralized */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 shadow-sm mb-5">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-500" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-500 bg-clip-text text-transparent">
              Get In Touch
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-[#111827]">
            Let's build your next
            <span className="block bg-gradient-to-r from-blue-600 via-blue-700 to-blue-500 bg-clip-text text-transparent">
              success story
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-gray-600 leading-8 max-w-2xl mx-auto">
            Tell us what you're building, what you need, or where your brand is
            stuck. We'll help you move it forward with clarity.
          </p>
        </div>

        {/* Main layout */}
        <div className="grid lg:grid-cols-12 gap-6 items-stretch">
          {/* Left */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-[28px] bg-gradient-to-r from-blue-600 via-blue-700 to-blue-500 text-white p-7 sm:p-8 shadow-xl">
              <p className="text-sm uppercase tracking-[0.18em] text-white/70 mb-4">
                Why reach out?
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
                We can't wait to win with you.
              </h2>

              <p className="mt-4 text-white/80 leading-7 text-sm sm:text-base">
                Whether it's brand strategy, digital execution, campaigns, web
                products, or a fresh direction for your business, this is a good
                place to start.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                  <p className="text-2xl font-bold">50+</p>
                  <p className="text-sm text-white/70 mt-1">SMEs supported</p>
                </div>

                <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                  <p className="text-2xl font-bold">6 Yrs</p>
                  <p className="text-sm text-white/70 mt-1">of experience</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-blue-100 bg-white p-6 sm:p-7 shadow">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600/70 mb-4">
                Direct Contact
              </p>

              <div className="space-y-5">
                {contactInfo.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <p className="text-[#111827] font-medium leading-7">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="lg:col-span-7">
            <div className="relative rounded-[32px] border border-blue-100 bg-white shadow overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-500" />

              <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex items-center justify-between gap-4 mb-8">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600/70 mb-2">
                      Start a conversation
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#111827]">
                      Send us a message
                    </h3>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Usually responds fast
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <input
                    placeholder="Name"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    className="w-full rounded-2xl border border-blue-100 px-4 py-3.5 focus:ring-4 focus:ring-blue-200 outline-none"
                  />

                  <input
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    className="w-full rounded-2xl border border-blue-100 px-4 py-3.5 focus:ring-4 focus:ring-blue-200 outline-none"
                  />

                  <input
                    placeholder="Subject"
                    onChange={(e) => setSubject(e.target.value)}
                    value={subject}
                    className="w-full rounded-2xl border border-blue-100 px-4 py-3.5 focus:ring-4 focus:ring-blue-200 outline-none"
                  />

                  <textarea
                    rows="5"
                    placeholder="Message..."
                    onChange={(e) => setMessage(e.target.value)}
                    value={message}
                    className="w-full rounded-2xl border border-blue-100 px-4 py-3.5 focus:ring-4 focus:ring-blue-200 outline-none"
                  />

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-500 text-white py-3.5 rounded-full font-semibold shadow-lg hover:scale-[1.02] transition"
                  >
                    {isLoading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Getintouch;