var recipe1 = {
    name: 'VCA',
    gain: 0.9,
    input: {
        name: 'Env',
        param:{
            gain: 3,
            attack: 0,
            decay: 0.2,
            sustain: 0,
            release: 0.01,
        },
        input: {
            name: 'Mixer',
            input1: {
                name: 'VCF',
                param: {
                    frequency: 400,
                    type: 'bandpass',
                    Q: 9,
                    gain: 1
                },
                input: {
                    name: 'Noise'
                }
            },
            input2: {
                name: 'VCO',
                param: {
                    frequency: 60,
                    type: 'sine'
                }
            }
        }
    }
};

var recipe2 = {
    name: 'VCA',
    gain: 0.9,
    input: {
        name: 'Env',
        param:{
            gain: 3,
            attack: 0,
            decay: 0.2,
            sustain: 0,
            release: 0.01,
        },
        input: {
            name: 'Mixer',
            input1: {
                name: 'VCF',
                param: {
                    frequency: 1000,
                    type: 'bandpass',
                    Q: 5,
                    gain: 1
                },
                input: {
                    name: 'Noise'
                }
            },
            input2: {
                name: 'VCO',
                param: {
                    frequency: 50,
                    type: 'sine'
                }
            }
        }
    }
};

var recipe3 = {
    name: 'VCA',
    gain: 0.9,
    input: {
        name: 'Env',
        param:{
            gain: 3,
            attack: 0,
            decay: 0.2,
            sustain: 0,
            release: 0.01,
        },
        input: {
            name: 'VCF',
            param: {
                frequency: 4000,
                type: 'bandpass',
                Q: 3,
                gain: 1
            },
            input: {
                name: 'Noise'
            }
        }
    }
};
