const utils = {
    formBundlePath(name, format, isProd=false) {
        return `/build/client/${name}.bundle.${isProd ? 'min.' : ''}${format}`;
    }
};

module.exports = utils;