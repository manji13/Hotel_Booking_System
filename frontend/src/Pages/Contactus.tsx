import { useEffect, useState } from "react";
import { FaWhatsapp, FaPaperPlane } from "react-icons/fa";
import UserNavbar from "../Header/UserNav";
import Footer from "../Footer/Footer";

const ContactUs = () => {
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    description: "",
  });

  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/contact/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed");

      alert("✅ Message sent successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        description: "",
      });
    } catch (error) {
      alert("❌ Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <UserNavbar />

      <div
        className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
        text-white transition-all duration-700
        ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h1 className="text-4xl font-bold text-center mb-3">Contact Us</h1>
          <p className="text-center text-gray-300 mb-14">
            We’re here to help you
          </p>

          <div className="grid md:grid-cols-2 gap-10">
            {/* CONTACT FORM */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <FaPaperPlane /> Send a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-1/2 px-4 py-3 rounded-lg bg-white/20 outline-none"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-1/2 px-4 py-3 rounded-lg bg-white/20 outline-none"
                  />
                </div>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 outline-none"
                />

                <textarea
                  name="description"
                  placeholder="Describe your inquiry..."
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full h-32 px-4 py-3 rounded-lg bg-white/20 outline-none resize-none"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600
                  font-semibold hover:scale-105 transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

            {/* WHATSAPP */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl
            flex flex-col justify-center items-center text-center">
              <h2 className="text-2xl font-semibold mb-4">
                Contact via WhatsApp
              </h2>
              <p className="text-gray-300 mb-6">
                Fast & instant response
              </p>

              <a
                href="https://wa.me/94764687979"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-500 px-8 py-4 rounded-full
                text-lg font-semibold hover:scale-110 transition"
              >
                <FaWhatsapp size={26} />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ContactUs;
