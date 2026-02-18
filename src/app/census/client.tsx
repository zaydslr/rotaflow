'use client'

import { useState } from 'react'
import { CensusSnapshot, DailyCensusPoint } from '@/app/actions/census'
import { ACUITY_LABELS, ACUITY_COLORS, RATIOS } from '@/lib/census-engine'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, BedDouble, Activity, TrendingUp, AlertTriangle } from 'lucide-react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts'

interface CensusDashboardClientProps {
    snapshot: CensusSnapshot
    trend: DailyCensusPoint[]
}

export function CensusDashboardClient({ snapshot, trend }: CensusDashboardClientProps) {
    const criticalCount = (snapshot.acuityCounts[4] || 0) + (snapshot.acuityCounts[5] || 0)

    return (
        <div className="container mx-auto py-10 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Activity className="h-8 w-8 text-primary" />
                    Census Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                    Live patient census · Acuity-based nurse requirements
                </p>
            </div>

            {/* Critical alert */}
            {criticalCount > 0 && (
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        {criticalCount} critical patient{criticalCount > 1 ? 's' : ''} (Level 4–5) currently admitted. Ensure adequate senior cover.
                    </p>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Occupied Beds</p>
                                <p className="text-5xl font-black text-primary mt-1">{snapshot.totalOccupied}</p>
                            </div>
                            <BedDouble className="h-10 w-10 text-primary/40" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-green-500/20 bg-green-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Nurses Required</p>
                                <p className="text-5xl font-black text-green-600 mt-1">{snapshot.requiredNurses}</p>
                            </div>
                            <Users className="h-10 w-10 text-green-500/40" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-amber-500/20 bg-amber-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Critical Patients</p>
                                <p className="text-5xl font-black text-amber-600 mt-1">{criticalCount}</p>
                            </div>
                            <AlertTriangle className="h-10 w-10 text-amber-500/40" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Acuity Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Acuity Breakdown</CardTitle>
                    <CardDescription>Patients per level and nurses required at each level</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {snapshot.acuityBreakdown.map(({ level, label, count, nursesNeeded, color }) => (
                            <div key={level} className="flex items-center gap-4">
                                <div
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: color }}
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-semibold">
                                            Level {level} — {label}
                                        </span>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span>{count} patient{count !== 1 ? 's' : ''}</span>
                                            <span className="text-xs">÷ {RATIOS[level]} ratio</span>
                                            <Badge
                                                variant="outline"
                                                className="font-bold"
                                                style={{ borderColor: color, color }}
                                            >
                                                {nursesNeeded} nurse{nursesNeeded !== 1 ? 's' : ''}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${Math.min(100, (count / Math.max(snapshot.totalOccupied, 1)) * 100)}%`,
                                                backgroundColor: color,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Trend Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        14-Day Census Trend
                    </CardTitle>
                    <CardDescription>Daily occupied beds vs required nurses</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorOccupied" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorNurses" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="occupied"
                                name="Occupied Beds"
                                stroke="#6366f1"
                                fill="url(#colorOccupied)"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="requiredNurses"
                                name="Required Nurses"
                                stroke="#22c55e"
                                fill="url(#colorNurses)"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Acuity Stacked Trend */}
            <Card>
                <CardHeader>
                    <CardTitle>Acuity Mix Over Time</CardTitle>
                    <CardDescription>How patient complexity has changed over the last 14 days</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={trend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend />
                            {[5, 4, 3, 2, 1].map(level => (
                                <Area
                                    key={level}
                                    type="monotone"
                                    dataKey={`acuity${level}`}
                                    name={`Level ${level}`}
                                    stackId="1"
                                    stroke={ACUITY_COLORS[level]}
                                    fill={ACUITY_COLORS[level]}
                                    fillOpacity={0.7}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
