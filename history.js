class History {
    constructor() {
        this.states = [];
        this.currentIndex = -1;
    }

    push(state) {
        // Remove any future states if we're not at the end
        this.states = this.states.slice(0, this.currentIndex + 1);
        this.states.push(state);
        this.currentIndex++;
        
        // Limit history size to prevent memory issues
        if (this.states.length > 20) {
            this.states.shift();
            this.currentIndex--;
        }
    }

    undo() {
        if (this.canUndo()) {
            this.currentIndex--;
            return this.states[this.currentIndex];
        }
        return null;
    }

    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            return this.states[this.currentIndex];
        }
        return null;
    }

    canUndo() {
        return this.currentIndex > 0;
    }

    canRedo() {
        return this.currentIndex < this.states.length - 1;
    }
}