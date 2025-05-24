import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Divider } from '@mui/material';
import { ActivityPresetClient } from '@/apis/activityPresets/types';
import { colors } from '../utils/colorUtils';
import { formatFieldValue } from '@/client/utils/foodDisplayUtils';

interface QuickPresetsSectionProps {
    activityPresets: ActivityPresetClient[];
    onPresetClick: (preset: ActivityPresetClient) => void;
}

export const QuickPresetsSection: React.FC<QuickPresetsSectionProps> = ({
    activityPresets,
    onPresetClick
}) => {
    if (activityPresets.length === 0) {
        return null;
    }

    return (
        <>
            <Divider sx={{ my: 4 }} />

            <Typography
                variant="h5"
                sx={{
                    fontWeight: 600,
                    fontSize: '22px',
                    color: '#1A1A1A',
                    mb: 2
                }}
            >
                Quick Presets
            </Typography>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 2,
                mt: 2
            }}>
                {activityPresets.slice(0, 6).map((preset) => (
                    <Card
                        key={preset._id}
                        sx={{
                            borderRadius: '12px',
                            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            cursor: 'pointer',
                            transition: 'transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.15)'
                            },
                            '&:active': {
                                transform: 'translateY(0px)'
                            }
                        }}
                        onClick={() => onPresetClick(preset)}
                    >
                        <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '16px' }}>
                                    {preset.name}
                                </Typography>
                                <Chip
                                    label={`${preset.usageCount} uses`}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'rgba(0, 122, 255, 0.1)',
                                        color: colors.primary,
                                        fontSize: '11px'
                                    }}
                                />
                            </Box>

                            {preset.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '14px' }}>
                                    {preset.description}
                                </Typography>
                            )}

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {Object.entries(preset.presetFields).slice(0, 3).map(([fieldName, fieldValue]) => {
                                    const formattedValue = formatFieldValue(fieldName, fieldValue);
                                    return (
                                        <Box key={fieldName} sx={{ display: 'inline-block' }}>
                                            {React.isValidElement(formattedValue) ? (
                                                formattedValue
                                            ) : (
                                                <Chip
                                                    label={formattedValue}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        fontSize: '11px',
                                                        height: '20px'
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    );
                                })}
                                {Object.keys(preset.presetFields).length > 3 && (
                                    <Chip
                                        label={`+${Object.keys(preset.presetFields).length - 3} more`}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            fontSize: '11px',
                                            height: '20px'
                                        }}
                                    />
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </>
    );
}; 