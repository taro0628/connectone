var recipe1 = {
        name: 'VCA',
        gain: 0.3,
        input: {
            name: 'Mixer',
            input1: {
                name: 'Env',
                param:{
                    gain: 0.8,
                    attack: 0,
                    decay: 0,
                    sustain: 0.5,
                    release: 0.5,
                },
                input:{
                    name: 'VCF',
                    param: {
                        type: 'lowpass',
                        frequency: 'cv',
                        Q: 2,
                        gain: 5
                    },
                    input: {
                        name: 'VCO',
                        param: {
                            frequency: "cv",
                            type: 'triangle'
                        }
                    }
                }
            },
            input2: {
                name: 'Env',
                param:{
                    gain: 0.2,
                    attack: 0,
                    decay: 0,
                    sustain: 0.5,
                    release: 0.5,
                },
                input:{
                    name: 'VCF',
                    param: {
                        type: 'highpass',
                        frequency: 'cv',
                        Q: 10,
                        gain: 2
                    },
                    input: {
                        name: 'VCO',
                        param: {
                            frequency: "cv",
                            octave: 1/2,
                            type: 'sawtooth'
                        }
                    }
                }
            }
        }
};

var recipe2 = {
        name: 'VCA',
        gain: 0.3,
        input: {
            name: 'Mixer',
            input1: {
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
                        type: 'sawtooth'
                    }
                }
            },
            input2: {
                name: 'Env',
                param:{
                    gain: 0.2,
                    attack: 0,
                    decay: 0,
                    sustain: 0.5,
                    release: 0.5,
                },
                input:{
                    name: 'VCO',
                    param: {
                        frequency: "cv",
                        detune: 100,
                        octave: 1/2,
                        type: 'sawtooth'
                    }
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
                attack: 0.5,
                decay: 0.2,
                sustain: 0.5,
                release: 0.5,
            },
            input:{
                name: 'VCF',
                param: {
                    type: 'lowpass',
                    frequency: 'cv',
                    detune: {
                        name: 'VCA',
                        gain: 100,
                        input: {
                            name: 'VCO',
                            param: {
                                frequency: 10,
                                type: 'sine'
                            }
                        }
                    },
                    Q: 10,
                    gain: 1
                },
                input: {
                    name: 'VCO',
                    param: {
                        frequency: "cv",
                        type: 'sawtooth'
                    }
                }
            }
        }
};
