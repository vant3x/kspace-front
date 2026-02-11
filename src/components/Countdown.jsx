import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Countdown.css';

export default function Countdown({ targetDate, variant = 'default' }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate) - new Date();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const timeUnits = [
        { value: timeLeft.days, label: 'DÍAS' },
        { value: timeLeft.hours, label: 'HORAS' },
        { value: timeLeft.minutes, label: 'MIN' },
        { value: timeLeft.seconds, label: 'SEG' }
    ];

    return (
        <div className={`countdown-container countdown-${variant}`}>
            {variant === 'mission' && (
                <motion.div
                    className="countdown-label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {/*   MISSION COUNTDOWN*/}
                </motion.div>
            )}

            <div className="countdown-units">
                {timeUnits.map((unit, index) => (
                    <motion.div
                        key={unit.label}
                        className="countdown-unit"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                        <motion.div
                            className="countdown-value"
                            key={unit.value}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            {String(unit.value).padStart(2, '0')}
                        </motion.div>
                        <div className="countdown-unit-label">{unit.label}</div>
                        {index < timeUnits.length - 1 && <div className="countdown-separator">:</div>}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
