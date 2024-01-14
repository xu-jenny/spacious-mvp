import os
import sys
import importlib.util
def install_prereqs(package_names):
    need_packages = []
    for package_name in package_names:
        try:
            result = importlib.util.find_spec(package_name)
            if result is None:
                need_packages.append(package_name)
        except ImportError:
            need_packages.append(package_name)
    
    print("need to install packages ", need_packages)
    if len(need_packages) > 0:
        import subprocess
        for package in need_packages:  
            print("installing %s" % package)  
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])

install_prereqs(['pandas', 'langchain', 'langchain_experimental', 'langchain_openai'])
import pandas as pd
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent
from langchain_openai import ChatOpenAI
from langchain.agents import AgentType

filename = sys.argv[1]
fileurl = sys.argv[2]
query = sys.argv[3]
openai_key = sys.argv[4]

def prepare_csv_data(filename, url):
    if os.path.isfile(filename):
        data = pd.read_csv(filename)
        print("loaded file from %s" % filename)
    else:
        print("downloading file from url: {}".format(url))
        try:
            data = pd.read_csv(url)
        except UnicodeDecodeError:
            data = pd.read_csv(url, encoding='latin')
        data.to_csv(filename, index=False)        
    data = data.where(pd.notnull(data), None)
    data.columns = data.columns.str.strip()
    return data

def csv_agent_chat(data, query):
    agent = create_pandas_dataframe_agent(
        ChatOpenAI(temperature=0.4, model="gpt-3.5-turbo-1106", api_key=openai_key),
        data,
        verbose=True,
        agent_type=AgentType.OPENAI_FUNCTIONS,
        max_iterations=15
    )
    print("created agent====")
    return agent.run(query)

data = prepare_csv_data(filename, fileurl)
result = csv_agent_chat(data, query)
print("====")
print(result)
# import subprocess
# import sys
# subprocess.check_call([sys.executable, "-m", "pip", "install", "pandas"])
# subprocess.check_call([sys.executable, "-m", "pip", "install", "langchain"])
# subprocess.check_call([sys.executable, "-m", "pip", "install", "langchain-experimental"])
# import os
# import pandas as pd
# from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent
# from langchain.chat_models import ChatOpenAI
# from langchain.agents import AgentType
# print("calling pd.read_csv")
# data = pd.read_csv("https://data.transportation.gov/api/views/ij7i-psm5/rows.csv?accessType=DOWNLOAD")
# print(data.head())
# agent = create_pandas_dataframe_agent(ChatOpenAI(temperature=0.4, model="gpt-3.5-turbo-1106", api_key="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"),data,verbose=True,agent_type=AgentType.OPENAI_FUNCTIONS)
# result = agent.run("What is the percentage of times there is congestion on 1/12/2015?")
# print(result)