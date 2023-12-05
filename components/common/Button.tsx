export type ButtonTheme = 'primary' | 'secondary' | 'outline';

type Props = {
    text: string
    onClick: (event: MouseEvent) => void
    type?: string
    theme?: ButtonTheme
}

const Button = ({ text, onClick, type = 'submit', theme = 'primary' }: Props) => {
    // let theme = switch(theme){
    //     case 'primary':
    //         return 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
    //     case 'secondary':
    //         return 'text-white bg-grey-500'
    //     default:
    //         return 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
    // }

    return (
        <button
          type={type}
          className={"mt-4 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2" + theme}
          onClick={onClick}
        >
          Confirm
        </button>
        )
})

export default Button;