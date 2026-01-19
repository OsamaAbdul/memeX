import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Rocket, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Roadmap = () => {
    const phases = [
        {
            quarter: 'Q1 2024',
            title: 'Foundation & Launch',
            status: 'completed',
            items: [
                'Meme Token Launchpad',
                'Project Concept & Design',
                'Smart Contract Development',
                'Website Launch',
                'Community Building'
            ]
        },
        {
            quarter: 'Q2 2024',
            title: 'Expansion & Features',
            status: 'in-progress',
            items: [
                'NFT Marketplace Integration',
                'Staking Mechanism',
                'Partnership Announcements',
                'Mobile App Beta'
            ]
        },
        {
            quarter: 'Q3 2024',
            title: 'Ecosystem Growth',
            status: 'upcoming',
            items: [
                'Cross-chain Bridge',
                'Governance DAO',
                'Exchange Listings',
                'Global Marketing Campaign'
            ]
        },
        {
            quarter: 'Q4 2024',
            title: 'Metaverse Integration',
            status: 'upcoming',
            items: [
                'Virtual World Alpha',
                'Avatar Customization',
                'Land Sales',
                'Metaverse Events'
            ]
        }
    ];

    return (
        <div className='min-h-screen bg-mvx-bg-primary text-mvx-text-primary overflow-hidden relative'>
            {/* Background Elements */}
            <div className='absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none'>
                <div className='absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-mvx-fuchsia-550/20 rounded-full blur-[100px]' />
                <div className='absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-mvx-purple-850/20 rounded-full blur-[100px]' />
                <div className='absolute bottom-0 left-[20%] w-[50%] h-[50%] bg-mvx-purple-925/20 rounded-full blur-[100px]' />
            </div>

            <div className='container mx-auto px-4 py-20 relative z-10'>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className='text-center mb-20'
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className='inline-flex items-center justify-center p-3 mb-6 rounded-full bg-mvx-purple-850/30 border border-mvx-purple-850/50 backdrop-blur-sm'
                    >
                        <Rocket className='w-6 h-6 text-mvx-fuchsia-550 mr-2' />
                        <span className='text-mvx-fuchsia-550 font-bold uppercase tracking-wider text-sm'>Our Journey</span>
                    </motion.div>

                    <h1 className='text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-mvx-text-primary via-mvx-fuchsia-550 to-mvx-text-primary'>
                        Roadmap
                    </h1>
                    <p className='text-xl text-mvx-text-secondary max-w-2xl mx-auto'>
                        Charting our course through the decentralized universe. Witness our milestones and join us as we build the future.
                    </p>
                </motion.div>

                <div className='relative max-w-5xl mx-auto'>
                    {/* Connecting Line (Desktop) */}
                    <div className='hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-mvx-fuchsia-550/50 to-transparent transform -translate-x-1/2' />

                    {phases.map((phase, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7, delay: index * 0.2 }}
                            className={`relative flex items-center justify-between md:justify-center mb-16 md:mb-24 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''
                                }`}
                        >
                            {/* Center Node */}
                            <div className='hidden md:flex absolute left-1/2 top-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-mvx-bg-primary border-4 border-mvx-bg-primary z-20 shadow-[0_0_20px_rgba(240,77,255,0.5)]'>
                                <div className={`w-full h-full rounded-full flex items-center justify-center ${phase.status === 'completed' ? 'bg-mvx-fuchsia-550' :
                                        phase.status === 'in-progress' ? 'bg-mvx-purple-850 animate-pulse' : 'bg-mvx-purple-875'
                                    }`}>
                                    {phase.status === 'completed' ? <CheckCircle2 className="w-6 h-6 text-white" /> :
                                        phase.status === 'in-progress' ? <Clock className="w-6 h-6 text-mvx-fuchsia-550" /> :
                                            <Circle className="w-6 h-6 text-mvx-text-secondary" />}
                                </div>
                            </div>

                            {/* Horizontal Connector Line (Desktop) */}
                            <div className={`hidden md:block absolute top-1/2 w-[calc(50%-3rem)] h-[2px] bg-gradient-to-r from-mvx-purple-850/50 to-mvx-fuchsia-550/50 z-0 ${index % 2 === 0 ? 'right-1/2 translate-x-[-1.5rem] origin-right' : 'left-1/2 translate-x-[1.5rem] origin-left'
                                }`} />

                            {/* Content Card */}
                            <div className={`w-full md:w-[45%] ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
                                <div className='group relative p-1 rounded-2xl bg-gradient-to-br from-mvx-purple-850/50 via-mvx-purple-925/50 to-transparent hover:from-mvx-fuchsia-550/50 hover:via-mvx-purple-850/50 transition-all duration-500'>
                                    <div className='absolute inset-0 rounded-2xl bg-mvx-purple-925/80 backdrop-blur-xl' />
                                    <div className='relative p-8 rounded-xl border border-mvx-purple-850/30 group-hover:border-mvx-fuchsia-550/30 transition-all duration-500'>

                                        {/* Abstract design element inside card */}
                                        <div className='absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity'>
                                            <Star className='w-24 h-24 text-mvx-fuchsia-550' />
                                        </div>

                                        <div className='flex items-center gap-4 mb-4'>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${phase.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                phase.status === 'in-progress' ? 'bg-mvx-fuchsia-550/20 text-mvx-fuchsia-550 border border-mvx-fuchsia-550/30' :
                                                    'bg-mvx-text-secondary/20 text-mvx-text-secondary border border-mvx-text-secondary/30'
                                                }`}>
                                                {phase.status}
                                            </span>
                                            <h3 className='text-3xl font-bangers text-mvx-text-primary tracking-wide'>{phase.quarter}</h3>
                                        </div>

                                        <h4 className='text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-mvx-text-primary to-mvx-text-secondary mb-6'>
                                            {phase.title}
                                        </h4>

                                        <ul className='space-y-3'>
                                            {phases[index].items.map((item, i) => (
                                                <li key={i} className='flex items-start gap-3 group/item'>
                                                    <div className={`mt-1.5 w-2 h-2 rounded-full ${phase.status === 'completed' ? 'bg-green-400' : 'bg-mvx-fuchsia-550'} group-hover/item:scale-125 transition-transform duration-300`} />
                                                    <span className='text-mvx-text-secondary group-hover/item:text-mvx-text-primary transition-colors duration-300'>
                                                        {item}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Spacer for desktop layout balance */}
                            <div className='hidden md:block w-[45%]' />
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className='mt-24 text-center'
                >
                    <div className='inline-block p-[2px] rounded-full bg-gradient-to-r from-mvx-fuchsia-550 via-mvx-purple-500 to-mvx-fuchsia-550'>
                        <Link
                            to='/dashboard'
                            className='block px-10 py-4 rounded-full bg-mvx-bg-primary text-white font-bold text-lg hover:bg-transparent transition-colors duration-300'
                        >
                            Start Building Now
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
