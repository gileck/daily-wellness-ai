import { useState, useCallback } from 'react';
import { ServingSize } from '@/server/database/collections/foods/types';

interface ServingsState {
    newServing: { name: string; gramsEquivalent: number };
}

const getDefaultServingsState = (): ServingsState => ({
    newServing: { name: '', gramsEquivalent: 0 },
});

export const useServingsManagement = (
    servings: ServingSize[],
    onAdd: (serving: ServingSize) => void,
    onRemove: (index: number) => void
) => {
    const [state, setState] = useState<ServingsState>(getDefaultServingsState());

    const handleNewServingChange = useCallback((field: 'name' | 'gramsEquivalent', value: string | number) => {
        setState(prev => ({
            ...prev,
            newServing: { ...prev.newServing, [field]: value }
        }));
    }, []);

    const handleAddServing = useCallback(() => {
        if (state.newServing.name && state.newServing.gramsEquivalent > 0) {
            onAdd({ ...state.newServing });
            setState(getDefaultServingsState());
        }
    }, [state.newServing, onAdd]);

    const canAddServing = state.newServing.name && state.newServing.gramsEquivalent > 0;

    return {
        newServing: state.newServing,
        canAddServing,
        handleNewServingChange,
        handleAddServing,
        handleRemoveServing: onRemove,
    };
}; 