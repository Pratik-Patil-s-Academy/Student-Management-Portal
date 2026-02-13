
import React, { useState, useEffect, useRef } from "react";
import { GraduationCap, HelpCircle, Trophy, TrendingUp, Users, Calendar, CheckCircle, ArrowRight, BookOpen, Star, Sparkles, Lightbulb, ClipboardList, BarChart, Target, Medal, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpeg";

const LandingPage = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Scroll Progress for Methodology Line
    const methodologyRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: methodologyRef,
        offset: ["start center", "end center"]
    });

    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <div className="min-h-screen bg-[var(--color-cream)] font-sans overflow-x-hidden selection:bg-[var(--color-dark-navy)] selection:text-white">

            {/* 1. Navbar (Floating & Glass) */}
            <nav
                className={`fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 rounded-full transition-all duration-500 ${scrolled ? "bg-[#2C3E50]/95 backdrop-blur-xl shadow-2xl py-3 border-[#2C3E50]" : "bg-[#2C3E50] py-4 border-transparent"} px-6 flex justify-between items-center text-white border border-white/10`}
            >
                <div className="text-xl font-bold flex items-center gap-3">
                    <img src={logo} alt="Academy Logo" className="w-12 h-12 rounded-full shadow-lg object-cover" />
                    <span className="tracking-tight font-extrabold">Pratik Patil's Academy</span>
                </div>

                <div className="hidden md:flex items-center gap-2">
                    <Link to="/enquiry" className="px-6 py-2 rounded-full hover:bg-white/10 transition-all font-medium flex items-center gap-2 text-sm uppercase tracking-wide">
                        <HelpCircle className="w-4 h-4" /> Enquiry
                    </Link>
                    <Link to="/admission" className="px-6 py-2 rounded-full bg-white text-[#2C3E50] font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <GraduationCap className="w-4 h-4" /> Admission
                    </Link>
                </div>

                {/* Mobile Menu Button - Placeholder */}
                <div className="md:hidden text-white">
                    <Link to="/enquiry" className="p-2">
                        <HelpCircle className="w-6 h-6" />
                    </Link>
                </div>
            </nav>

            {/* 2. Hero Section */}
            <header className="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-8 px-6 pt-36 pb-20 bg-[var(--color-cream)] relative overflow-hidden">
                {/* Animated Background blobs */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-3xl -z-10"
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-200/40 rounded-full blur-3xl -z-10"
                />

                <div className="lg:w-1/2 space-y-8 relative z-10 text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2C3E50]/5 border border-[#2C3E50]/10 text-[#2C3E50] text-sm font-bold mb-2 shadow-sm"
                    >
                        <Trophy className="w-4 h-4 text-yellow-600" />
                        <span>#1 Coaching Institute in the City</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-extrabold text-[#2C3E50] leading-tight flex flex-col gap-2"
                    >
                        <span>Shaping Future</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2C3E50] to-blue-600">Leaders</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium"
                    >
                        Premier Coaching for 11th & 12th Science. Unlock your potential with expert guidance and a proven track record.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4"
                    >
                        <Link to="/admission">
                            <button className="px-8 py-4 bg-[#2C3E50] text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2 group">
                                Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </motion.div>
                </div>

                {/* Right Content - Hero Cards (Original Styles, No Overlap) */}
                <div className="lg:w-1/2 flex flex-col md:flex-row gap-8 items-center justify-center relative mt-12 lg:mt-0">
                    {/* Card 1: Enquiry Passport (White/Glass) */}
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1, y: [0, -15, 0] }}
                        transition={{
                            x: { duration: 0.8, delay: 0.5 },
                            opacity: { duration: 0.8, delay: 0.5 },
                            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                        whileHover={{ scale: 1.05 }}
                        className="w-72 aspect-[3/4] bg-white/90 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] p-8 flex flex-col justify-between z-10 ring-1 ring-gray-100"
                    >
                        <div>
                            <div className="w-16 h-16 rounded-2xl bg-[#2C3E50]/10 flex items-center justify-center mb-6 mx-auto">
                                <HelpCircle className="w-8 h-8 text-[#2C3E50]" />
                            </div>
                            <h3 className="text-xl font-bold mb-1 text-[#2C3E50] text-center uppercase tracking-wider">Submit</h3>
                            <h4 className="text-2xl font-black text-[#2C3E50] text-center">ENQUIRY</h4>
                            <div className="w-10 h-1 bg-yellow-400 mx-auto mt-4 rounded-full" />
                        </div>
                        <div className="text-center my-auto">
                            <p className="text-sm font-bold text-gray-400 tracking-widest mb-1">Questions?</p>
                            <p className="text-gray-600 font-medium text-sm">Get expert guidance today.</p>
                        </div>
                        <Link to="/enquiry" className="w-full">
                            <button className="w-full py-3 border-2 border-[#2C3E50] text-[#2C3E50] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#2C3E50] hover:text-white transition-all uppercase tracking-wide text-sm">
                                Submit Enquiry
                            </button>
                        </Link>
                    </motion.div>

                    {/* Card 2: Admission Ticket (Navy) */}
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1, y: [0, -20, 0] }}
                        transition={{
                            x: { duration: 0.8, delay: 0.7 },
                            opacity: { duration: 0.8, delay: 0.7 },
                            y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }
                        }}
                        whileHover={{ scale: 1.05 }}
                        className="w-72 aspect-[3/4] bg-[#2C3E50] rounded-[2.5rem] shadow-2xl p-8 flex flex-col justify-between text-white border border-white/10 ring-4 ring-white/20 lg:-mt-24"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
                        <div>
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 mx-auto backdrop-blur-md">
                                <GraduationCap className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-1 text-center uppercase tracking-wider">Get</h3>
                            <h4 className="text-2xl font-black text-center text-white">ADMISSION</h4>
                            <div className="w-10 h-1 bg-[#ef4444] mx-auto mt-4 rounded-full" />
                        </div>
                        <div className="text-center my-auto relative z-10">
                            <p className="text-sm font-bold text-white/50  tracking-widest mb-1">Why wait?</p>
                            <p className="text-lg font-bold text-white flex items-center justify-center gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                Apply Now
                            </p>
                        </div>
                        <Link to="/admission" className="w-full relative z-10">
                            <button className="w-full py-3 bg-white text-[#2C3E50] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors uppercase tracking-wide text-sm">
                                Secure Seat
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </header>

            {/* 3. Achievements (Bento Grid) - Strict Colors */}
            <section id="achievements" className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-extrabold text-[#2C3E50] mb-4 tracking-tight">OUR ACHIEVEMENTS</h2>
                        <div className="w-24 h-1.5 bg-[#ef4444] mx-auto rounded-full" />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* 500+ Selections - Navy Blue */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -10, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                            viewport={{ once: true }}
                            className="col-span-1 md:col-span-2 bg-[#1e3a8a] text-white rounded-[2.5rem] p-10 shadow-xl flex flex-col justify-between h-[320px] relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:scale-110 transition-transform duration-700 ease-out">
                                <Trophy size={180} />
                            </div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center backdrop-blur-sm mb-6 shadow-inner ring-1 ring-white/10">
                                    <Trophy className="w-8 h-8 text-yellow-400" />
                                </div>
                                <h3 className="text-6xl font-black mb-2 tracking-tighter">500+</h3>
                                <p className="text-xl font-bold uppercase tracking-wider text-white/80">Selections</p>
                            </div>
                            <p className="relative z-10 text-white/60 font-medium">Top Engineering & Medical Colleges</p>
                        </motion.div>

                        {/* 95% Success Rate - Gold */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -10, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="col-span-1 md:col-span-1 bg-[#d97706] text-white rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between h-[320px] relative overflow-hidden"
                        >
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                            <div className="w-14 h-14 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
                                <TrendingUp className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-5xl font-black mb-2 tracking-tighter">95%</h3>
                                <p className="text-lg font-bold uppercase tracking-wide text-white/90">Success Rate</p>
                            </div>
                            <p className="text-sm text-white/70 font-medium mt-auto">Consistently delivering results.</p>
                        </motion.div>

                        {/* 50+ City Toppers - Red */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -10, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="col-span-1 md:col-span-1 bg-[#ef4444] text-white rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between h-[320px] relative overflow-hidden"
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                            <div className="w-14 h-14 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner relative z-10">
                                <Medal className="w-7 h-7 text-white" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-5xl font-black mb-2 tracking-tighter">50+</h3>
                                <p className="text-lg font-bold uppercase tracking-wide text-white/90">City Toppers</p>
                            </div>
                            <p className="text-sm text-white/70 font-medium mt-auto relative z-10">District rankers every year.</p>
                        </motion.div>

                        {/* 20 Years - Light/White */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -10, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="col-span-1 md:col-span-1 bg-white border border-gray-100 text-[#2C3E50] rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between h-[320px]"
                        >
                            <div className="w-14 h-14 rounded-3xl bg-blue-50 flex items-center justify-center shadow-sm">
                                <Calendar className="w-7 h-7 text-[#2C3E50]" />
                            </div>
                            <div>
                                <h3 className="text-5xl font-black mb-2 tracking-tighter">20</h3>
                                <p className="text-lg font-bold uppercase tracking-wide text-gray-500">Years</p>
                            </div>
                            <p className="text-sm text-gray-400 font-medium mt-auto">Legacy of excellence.</p>
                        </motion.div>

                        {/* CTA Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            viewport={{ once: true }}
                            className="col-span-1 md:col-span-3 bg-gradient-to-r from-[#2C3E50] to-[#1e3a8a] text-white rounded-[2.5rem] p-10 shadow-xl flex flex-col md:flex-row items-center justify-between min-h-[200px] relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10 mb-6 md:mb-0">
                                <h3 className="text-3xl font-black mb-2">Ready to start?</h3>
                                <p className="text-white/70 max-w-lg text-lg">Join hundreds of students achieving their dreams.</p>
                            </div>
                            <Link to="/admission" className="relative z-10">
                                <button className="px-10 py-5 bg-white text-[#2C3E50] rounded-2xl font-black uppercase tracking-wider hover:bg-gray-100 transition-all shadow-lg hover:shadow-white/20">
                                    Enroll Now
                                </button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 4. Our Toppers (Updated UI) */}
            <section className="py-24 px-6 bg-[var(--color-cream)]">
                <div className="max-w-7xl mx-auto mb-16 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-extrabold text-[#2C3E50] mb-4"
                    >
                        OUR TOPPERS
                    </motion.h2>
                    <div className="w-24 h-1.5 bg-[#d97706] mx-auto rounded-full" />
                </div>

                {/* Carousel Container */}
                <div className="overflow-hidden py-10">
                    <motion.div
                        className="flex gap-8 w-max"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
                    >
                        {[...Array(6)].map((_, i) => (
                            // Repeating Mock Data for Loop
                            [
                                { name: "Anya Sharma", rank: "AIR 1 - JEE Adv", score: "360/360", quote: "The faculty's guidance was invaluable.", color: "bg-blue-50" },
                                { name: "Mois Shamar", rank: "AIR 15 - NEET", score: "710/720", quote: "Best coaching institute ever.", color: "bg-green-50" },
                                { name: "Kollo Ronlay", rank: "State 1st", score: "99.9%", quote: "Personal attention made the difference.", color: "bg-yellow-50" },
                                { name: "Priya Patel", rank: "AIR 45 - JEE", score: "99.8%", quote: "Mock tests were very helpful.", color: "bg-purple-50" },
                            ].map((student, idx) => (
                                <div key={`${i}-${idx}`} className="w-[350px] bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100 flex flex-col items-center text-center relative hover:scale-105 transition-transform duration-300">
                                    {/* Photo Placeholder */}
                                    <div className={`w-32 h-32 rounded-3xl ${student.color} mb-6 flex items-center justify-center shadow-inner`}>
                                        <Users className="w-16 h-16 text-[#2C3E50]/40" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-[#2C3E50] mb-1">{student.name}</h3>
                                    <div className="px-4 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wide mb-4 flex items-center gap-1">
                                        <Trophy className="w-3 h-3" /> {student.rank}
                                    </div>

                                    <div className="relative bg-gray-50 p-4 rounded-xl w-full mt-auto">
                                        <span className="absolute -top-3 left-4 text-4xl text-gray-300 font-serif">"</span>
                                        <p className="text-gray-600 text-sm italic relative z-10">{student.quote}</p>
                                        <p className="text-xs font-bold text-[#2C3E50] mt-2 text-right">- {student.name}</p>
                                    </div>
                                </div>
                            ))
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 5. Teaching Methodology (Neon Line & Scroll Animations) */}
            <section id="methodology" className="py-24 px-6 bg-[#2C3E50] relative overflow-hidden" ref={methodologyRef}>
                {/* Background pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-24"
                    >
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">TEACHING METHODOLOGY</h2>
                        <div className="w-24 h-1.5 bg-[#ef4444] mx-auto rounded-full" />
                    </motion.div>

                    <div className="relative">
                        {/* Neon Timeline Line */}
                        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-white/10 -translate-x-1/2 rounded-full overflow-hidden">
                            <motion.div
                                style={{ height: lineHeight }}
                                className="w-full bg-gradient-to-b from-blue-400 via-cyan-400 to-teal-400 shadow-[0_0_20px_rgba(56,189,248,0.8)]"
                            />
                        </div>

                        {/* Steps */}
                        {[
                            { title: "CONCEPT BUILDING", desc: "Focus on fundamental concepts for strong base.", icon: Lightbulb },
                            { title: "PERSONALIZED DOUBT SOLVING", desc: "1-on-1 sessions to clear every doubt.", icon: HelpCircle },
                            { title: "REGULAR MOCK TESTS", desc: "Weekly tests to track performance.", icon: ClipboardList },
                            { title: "PERFORMANCE ANALYSIS", desc: "Detailed analysis to identify weak areas.", icon: BarChart },
                            { title: "EXAM READINESS", desc: "Strategic preparation for final exams.", icon: Target },
                        ].map((step, index) => {
                            const Card = ({ index, step }) => {
                                const ref = useRef(null);
                                const isInView = useInView(ref, { margin: "-100px 0px -100px 0px" });

                                return (
                                    <motion.div
                                        ref={ref}
                                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                        className={`relative flex md:justify-between items-center mb-24 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                                    >
                                        {/* Node */}
                                        <div className={`absolute left-6 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-16 h-16 rounded-full border-4 border-[#2C3E50] z-10 transition-all duration-500 ${isInView ? "bg-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.6)] scale-110" : "bg-[#172554] shadow-none scale-100"}`}>
                                            <step.icon size={28} className="text-white" strokeWidth={1.5} />
                                        </div>

                                        {/* Empty side for layout balance */}
                                        <div className="hidden md:block w-[45%]"></div>

                                        {/* Card */}
                                        <div className={`w-[calc(100%-6rem)] md:w-[45%] ml-24 md:ml-0 group`}>
                                            <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all hover:border-white/20 hover:shadow-2xl">
                                                <h3 className="text-xl font-bold text-white mb-2 uppercase flex items-center gap-3">
                                                    <span className="text-cyan-400 text-2xl opacity-50 font-black">0{index + 1}</span>
                                                    {step.title}
                                                </h3>
                                                <p className="text-gray-300 leading-relaxed text-sm font-medium">{step.desc}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            };
                            return <Card key={index} index={index} step={step} />;
                        })}
                    </div>
                </div>
            </section>

            {/* 6. Special Batches (Horizontal Scroll) */}
            <section id="batches" className="py-24 px-6 bg-[var(--color-cream)]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-12">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-[#2C3E50] border-l-8 border-[#ef4444] pl-6">
                            Special Batches
                        </h2>
                        <div className="hidden md:flex gap-2">
                            <button className="p-3 rounded-full border border-[#2C3E50]/20 hover:bg-[#2C3E50] hover:text-white transition-all"><ChevronLeft /></button>
                            <button className="p-3 rounded-full border border-[#2C3E50]/20 hover:bg-[#2C3E50] hover:text-white transition-all"><ChevronRight /></button>
                        </div>
                    </div>

                    <div className="flex overflow-x-auto gap-8 pb-12 snap-x hide-scrollbar scroll-smooth">
                        {[
                            { name: "JEE Mains + Advanced", features: ["Physics, Chemistry, Maths", "Daily Practice Papers", "Mock Test Series"] },
                            { name: "NEET Medical", features: ["Physics, Chemistry, Biology", "NCERT Focused", "Expert Biology Faculty"] },
                            { name: "MHT-CET Target", features: ["State Board Syllabus", "Speed & Accuracy Focus", "Full Length Tests"] },
                            { name: "11th & 12th Foundation", features: ["Strong Concept Building", "Board Exam Prep", "Regular PTMs"] },
                        ].map((batch, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                                key={index}
                                className="min-w-[320px] md:min-w-[380px] bg-white rounded-[2.5rem] p-8 flex flex-col border border-gray-100 shadow-xl snap-center hover:shadow-2xl transition-all group"
                            >
                                <div className="h-full flex flex-col">
                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 text-[#2C3E50] group-hover:bg-[#2C3E50] group-hover:text-white transition-colors duration-300">
                                        <BookOpen className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-6 text-[#2C3E50]">{batch.name}</h3>
                                    <ul className="space-y-4 flex-grow">
                                        {batch.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-600 font-medium">
                                                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button className="w-full mt-8 py-4 rounded-2xl border-2 border-[#2C3E50] text-[#2C3E50] font-bold hover:bg-[#2C3E50] hover:text-white transition-all uppercase tracking-wide text-sm flex items-center justify-center gap-2">
                                        View Details <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. Footer */}
            <footer className="bg-[#172554] text-white rounded-t-[3rem] mt-0 pt-24 pb-12 px-6 relative overflow-hidden">
                {/* Footer pattern */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500" />
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 text-3xl font-bold mb-6">
                            <img src={logo} alt="Academy Logo" className="w-12 h-12 rounded-full shadow-lg object-cover" />
                            <span>Pratik Patil's Academy</span>
                        </div>
                        <p className="text-white/70 max-w-sm text-lg leading-relaxed">
                            Empowering students to reach their full potential through quality education, expert guidance, and a commitment to excellence.
                        </p>
                        <div className="flex gap-4 mt-8">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors backdrop-blur-sm">
                                <Users className="w-5 h-5" />
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors backdrop-blur-sm">
                                <Star className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xl font-bold mb-6 text-yellow-500 uppercase tracking-widest text-sm">Quick Links</h4>
                        <div className="flex flex-col gap-4 text-white/80 font-medium">
                            <a href="#" className="hover:text-yellow-400 transition-colors flex items-center gap-2 group"><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> Home</a>
                            <a href="#achievements" className="hover:text-yellow-400 transition-colors flex items-center gap-2 group"><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> Achievements</a>
                            <a href="#batches" className="hover:text-yellow-400 transition-colors flex items-center gap-2 group"><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> Batches</a>
                            <Link to="/enquiry" className="hover:text-yellow-400 transition-colors flex items-center gap-2 group"><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> Contact Us</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xl font-bold mb-6 text-yellow-500 uppercase tracking-widest text-sm">Contact Us</h4>
                        <div className="flex flex-col gap-4 text-white/80">
                            <p className="flex items-start gap-3">
                                <span className="bg-white/10 p-2 rounded-lg"><HelpCircle className="w-4 h-4" /></span>
                                123 Education Lane, Science City, Maharastra
                            </p>
                            <p className="flex items-center gap-3">
                                <span className="bg-white/10 p-2 rounded-lg"><CheckCircle className="w-4 h-4" /></span>
                                +91 98765 43210
                            </p>
                            <p className="flex items-center gap-3">
                                <span className="bg-white/10 p-2 rounded-lg"><Sparkles className="w-4 h-4" /></span>
                                info@pratikpatilacademy.com
                            </p>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-sm">
                    <p>© 2024 Pratik Patil's Academy. All rights reserved.</p>
                    <p>Designed with ❤️ for Excellence</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
