// import { getOptions } from 'loader-utils';

export = function(content: string): string {
	// const options = getOptions(this);
	return JSON.stringify(content);
};
