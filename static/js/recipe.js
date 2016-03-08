var bassdrum = {
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

var snare = {
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

var highhat = {
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

var tone1 = {
    name: 'VCA',
    gain: 0.9,
    input: {
        name: 'Env',
        param:{
            gain: 2,
            attack: 0.3,
            decay: 0.2,
            sustain: 0.5,
            release: 0.1,
        },
        input: {
            name: 'VCF',
            param: {
                frequency: 400,
                type: 'bandpass',
                Q: 8,
                gain: 1
            },
            input: {
                name: 'VCO',
                param: {
                    frequency: 'cv',
                    type: 'triangle'
                }
            }
        }
    }
};

var tone2 = {
    name: 'VCA',
    gain: 0.9,
    input: {
        name: 'Env',
        param:{
            gain: 2,
            attack: 0.3,
            decay: 0.2,
            sustain: 0.5,
            release: 0.1,
        },
        input: {
            name: 'VCF',
            param: {
                frequency: 400,
                type: 'bandpass',
                Q: 8,
                gain: 1
            },
            input: {
                name: 'VCO',
                param: {
                    frequency: 'cv',
                    type: 'square'
                }
            }
        }
    }
};

var tone3 = {
    name: 'VCA',
    gain: 0.9,
    input: {
        name: 'Env',
        param:{
            gain: 2,
            attack: 0.3,
            decay: 0.2,
            sustain: 0.5,
            release: 0.1,
        },
        input: {
            name: 'VCF',
            param: {
                frequency: 400,
                type: 'bandpass',
                Q: 8,
                gain: 1
            },
            input: {
                name: 'VCO',
                param: {
                    frequency: 'cv',
                    type: 'sawtooth'
                }
            }
        }
    }
};
