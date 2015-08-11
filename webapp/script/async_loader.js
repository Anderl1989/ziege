var AsyncLoader = function(){
	var methods = [];
	
	this.addMethod = function(fn, arguments, onSuccess, onError){
		methods.push({fn:fn, arguments: arguments, onSuccess: onSuccess, onError: onError});
	};
	
	this.execute = function(onSuccess, onError){
		executeOne(0, onSuccess, onError);
	}
	
	var executeOne = function(i, onSuccess, onError){
		if(i < methods.length){
			var args = methods[i].arguments;
			args.push(function(obj){ //success
				methods[i].onSuccess(obj);
				executeOne(i+1, onSuccess, onError);
			});
			args.push(function(obj){ //error
				methods[i].onError(obj);
				methods = [];
				onError();
			});
			methods[i].fn.apply(window, args);
		} else {
			methods = [];
			onSuccess();
		}
	}
};