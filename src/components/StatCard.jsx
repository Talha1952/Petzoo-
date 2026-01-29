import React from 'react';
import { cn } from '../lib/utils'; // Keep simpler import for now or just generic

export function StatCard({ title, value, icon, color = "blue", onClick, subValue }) {
    const colorClasses = {
        blue: "border-blue-500 text-blue-600",
        green: "border-primary text-primary",
        orange: "border-accent text-accent",
        red: "border-danger text-danger",
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-white p-5 rounded-lg shadow-sm border-l-4 transition-transform hover:-translate-y-1 cursor-pointer",
                colorClasses[color] || colorClasses.blue
            )}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wide">{title}</h3>
                    <div className="text-2xl font-bold mt-1 text-gray-800">{value}</div>
                    {subValue && <div className="text-xs text-gray-400 mt-1">{subValue}</div>}
                </div>
                {icon && <div className={cn("p-2 rounded-lg bg-opacity-10", `bg-${color}-500`)}>{icon}</div>}
            </div>
        </div>
    );
}
