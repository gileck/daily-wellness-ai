import React from 'react';
import { ListItem, ListItemText, Typography, Box, Chip, Avatar } from '@mui/material';
import { format } from 'date-fns';
import { WellnessMetricRecord } from '@/apis/wellnessMetrics/types';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { MetricActions } from './MetricActions';

interface MetricRecordItemProps {
    record: WellnessMetricRecord;
    onEdit?: (record: WellnessMetricRecord) => void;
    onDelete?: (recordId: string) => Promise<boolean>;
}

export const MetricRecordItem: React.FC<MetricRecordItemProps> = ({ record, onEdit, onDelete }) => {
    const getValueDisplay = (value: number | string): string => {
        if (typeof value === 'number') {
            return `${value}/10`;
        }
        return String(value);
    };

    const getValueColor = (value: number | string): string => {
        if (typeof value === 'number') {
            if (value >= 8) return '#34C759'; // Green for high values
            if (value >= 6) return '#FF9500'; // Orange for medium values
            if (value >= 4) return '#FFCC00'; // Yellow for medium-low values
            return '#FF3B30'; // Red for low values
        }
        return '#007AFF'; // Default blue for text values
    };

    return (
        <ListItem
            alignItems="flex-start"
            sx={{
                py: 2,
                px: 3,
                '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.03)'
                }
            }}
        >
            <Avatar
                sx={{
                    bgcolor: '#34C759',
                    width: 40,
                    height: 40,
                    mr: 2,
                    mt: 0.5
                }}
            >
                <TrendingUpIcon />
            </Avatar>

            <ListItemText
                primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontSize: '17px',
                                fontWeight: 500,
                                color: '#34C759'
                            }}
                        >
                            {record.metricName}
                        </Typography>
                        {onEdit && onDelete && (
                            <MetricActions
                                record={record}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        )}
                    </Box>
                }
                secondary={
                    <>
                        <Typography
                            component="span"
                            variant="body2"
                            sx={{
                                display: 'block',
                                color: 'text.secondary',
                                fontSize: '15px',
                                mb: 1
                            }}
                        >
                            {format(new Date(record.timestamp), 'PPP p')}
                        </Typography>
                        {record.notes && (
                            <Typography
                                component="p"
                                variant="body2"
                                sx={{
                                    mt: 1,
                                    fontSize: '15px',
                                    color: 'text.primary',
                                    mb: 1.5
                                }}
                            >
                                {record.notes}
                            </Typography>
                        )}
                        <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Chip
                                label={`Value: ${getValueDisplay(record.value)}`}
                                variant="outlined"
                                size="small"
                                sx={{
                                    borderColor: getValueColor(record.value),
                                    color: getValueColor(record.value),
                                    fontSize: '13px',
                                    '& .MuiChip-label': {
                                        px: 1.5
                                    }
                                }}
                            />
                        </Box>
                    </>
                }
            />
        </ListItem>
    );
}; 