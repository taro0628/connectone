var recipe1 = {
    name: 'VCA',
    gain: 0.3,
    input: {
        name: 'Env',
        param:{
            gain: 0.8,
            attack: 0,
            decay: 0,
            sustain: 0.5,
            release: 0.5,
        },
        input: {
            name: 'VCF',
            param: {
                type: 'lowpass',
                frequency: 'cv',
                Q: 7,
                gain: 1
            },
            input: {
                name: 'VCO',
                param: {
                    frequency: "cv",
                    type: 'sine'
                }
            }
        }
    }
};

var recipe2 = {
    name: 'VCA',
    gain: 0.3,
    input: {
        name: 'Env',
        param:{
            gain: 0.8,
            attack: 0,
            decay: 0,
            sustain: 0.5,
            release: 0.5,
        },
        input: {
            name: 'VCO',
            param: {
                frequency: "cv",
                type: 'triangle'
            }
        }
    }
};

var recipe3 = {
    name: 'VCA',
    gain: 0.3,
    input: {
        name: 'Env',
        param:{
            gain: 0.8,
            attack: 0,
            decay: 0,
            sustain: 0.5,
            release: 0.5,
        },
        input: {
            name: 'VCO',
            param: {
                frequency: "cv",
                type: 'square'
            }
        }
    }
};
