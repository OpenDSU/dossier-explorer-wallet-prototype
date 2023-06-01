const walletContentViewModel = {
    files: {
        type: 'file',
        icon: 'file',
        dataType: 'file',
        isFile: true
    },
    folders: {
        type: 'folder',
        icon: 'folder',
        dataType: 'folder'
    },
    mounts: {
        type: 'dossier',
        icon: 'lock',
        dataType: 'mount',
        isDSU: true
    },
    defaultSortedViewModel: {
        name: {
            isSorted: false,
            descending: false,
        },
        type: {
            isSorted: false,
            descending: false
        }
    }
}

export default walletContentViewModel;