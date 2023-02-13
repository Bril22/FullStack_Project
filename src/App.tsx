import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import './App.css';
import { API_2_URL } from "./api";
import { helpers } from "./helpers";
import StatusColor from "./components/statusColor";

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  createdOn: string;
  archived: boolean;
  isArchived: boolean;
}

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const projectsPerPage:number = 8;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [showArchived, setShowArchived] = useState<string>("unarchived");
  const [showStatus, setShowStatus] = useState<string>("all-status")
  const [searchFiltered, setSearchFiltered] = useState<string>("");

  interface TableTitles {
    name: string;
    type: string;
    status: string;
    created: string;
    manage: string;
  }

  const tableTitles: TableTitles = {
    name: "Name",
    type: "Type",
    status: "Status",
    created: "Created",
    manage: "Manage",
  }

  interface TextInfo {
    data: string;
    status: string;
    prev: string;
    next: string;
  }

  const textInfo: TextInfo = {
    data: "Data: ",
    status: "Status: ",
    prev: "Prev",
    next: "Next",
  }

  const fetchData = async (filter: string, statusFilter: string) => {
    try {
      const result = await axios.get(API_2_URL);
      let filteredData = result.data;
      if (filter === "all-data") {
        let allData = result.data
        if (statusFilter === "all-status") {
          filteredData = allData;
        } else {
          filteredData = allData.filter((project: Project) => project.status === statusFilter);
        }
      } else if (filter === "archived") {
        let archivedData = result.data.filter((project: Project) => project.archived === true);
        if (statusFilter === "all-status") {
          filteredData = archivedData;
        } else {
          filteredData = archivedData.filter((project: Project) => project.status.toUpperCase() === statusFilter);
        }
      } else if (filter === "unarchived") {
        let unArchivedData = result.data.filter((project: Project) => project.archived === false);
        if (statusFilter === "all-status") {
          filteredData = unArchivedData;
        } else {
          filteredData = unArchivedData.filter((project: Project) => project.status.toUpperCase() === statusFilter);
        }
      }
      setProjects(filteredData);
      setTotalPages(Math.ceil(filteredData.length / projectsPerPage));
    } catch (err) {
        console.log(err);
    }
  };
  
  useEffect(() => {
    fetchData(showArchived, showStatus);
  }, [showArchived, showStatus]);

  const handlePrevClick = () => { 
    setCurrentPage(currentPage - 1);
  };

  const handleNextClick = () => {
    setCurrentPage(currentPage + 1);
  };

  const updateArchivedStatus = async (project:Project) => {
    try {
      const data = { 
        id: project.id,
        name: project.name,
        status: project.status,
        type: project.type,
        createdOn: project.createdOn,
        archived: !project.archived 
      };
      const response = await axios.put(`${API_2_URL}/${project.id}`, data);
      const updatedProject = response.data;
      const index = projects.findIndex(p => p.id === project.id);
      const newProjects = [
        ...projects.slice(0, index),
        updatedProject,
        ...projects.slice(index + 1)
      ];
      setProjects(newProjects);
      fetchData(showArchived, showStatus);
      
    } catch (error) {
      console.error(error);
    }
  };


  const startPage = (currentPage - 1) * projectsPerPage;
  const endPage = startPage + projectsPerPage;
  const currentProjects = projects.slice(startPage, endPage);

  const pageNumberInfo = (currentPage: number, totalPages: number) => {
    return `Page ${currentPage} of ${totalPages}`;
  };

  const handleChangeArchivedFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    setShowArchived(e.target.value);
    setCurrentPage(1);
  };

  const handleChangeStatusFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    setShowStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    let filteredProjects;
    if (searchFiltered) {
      filteredProjects = currentProjects.filter(
        (project: Project) =>
          project.name.toLowerCase().indexOf(searchFiltered) > -1
      );
    } else {
      filteredProjects = currentProjects;
    }
    setTotalPages(Math.ceil(filteredProjects.length / projectsPerPage));
    setProjects(filteredProjects);
    setSearchFiltered(event.currentTarget.value);
  };

  const resetFilters = () => {
    setSearchFiltered("");
    if (showArchived === "all-data") {
      setShowArchived("all-data");
      setShowStatus("all-status");
      fetchData("all-data", showStatus);
    } else if (showArchived === "archived") {
      setShowArchived("archived");
      setShowStatus("all-status");
      fetchData("archived", showStatus);
    } else {
      setShowArchived("unarchived");
      setShowStatus("all-status");
      fetchData("unarchived", showStatus);
    }
    setCurrentPage(1);  
  }
  
  return (
    <div className="Page">
      <div className="title">
        <h2>Hello User</h2>
        <p>Here are the list of projects you submitted</p>
      </div>
      <div className="App">
        <div className="wrapper">
          <div className="filter_wrap">
            <div className="search_bar">
              <input
                type="text"
                value={searchFiltered}
                onChange={handleSearch}
                placeholder="Search by Name"
              />
            </div>
            <div className="archived_filter">
              <label>{textInfo.data}</label>
              <select value={showArchived} onChange={handleChangeArchivedFilter}>
                <option value="all-data">All</option>
                <option value="archived">Archived</option>
                <option value="unarchived">Unarchived</option>
              </select>
            </div>
            <div className="status_filter">
              <label>{textInfo.status}</label>
              <select value={showStatus} onChange={handleChangeStatusFilter}>
                <option value="all-status">All</option>
                <option value="COMPLETED">Completed</option>
                <option value="INCOMPLETE">Incomplete</option>
                <option value="EDITING">Editing</option>
                <option value="SHOOTING">Shooting</option>
                <option value="FEEDBACK">Feedback</option>
              </select>
            </div>
            <button className="button_reset" onClick={resetFilters}>Clear Filters</button>
          </div>
          <table id="projects">
            <thead>
              <tr>
                <th>{tableTitles.name}</th>
                <th>{tableTitles.type}</th>
                <th>{tableTitles.status}</th>
                <th>{tableTitles.created}</th>
                <th>{tableTitles.manage}</th>
              </tr>
            </thead>
            <tbody>
              {currentProjects.map(project => (
                  <tr key={project.id}>
                    <td>
                      {project.name}
                    </td>
                    <td>
                      {project.type}
                    </td>
                    <StatusColor status={helpers.capitalize(project.status)}/>
                    <td>
                      {helpers.formatDate(project.createdOn)}
                    </td> 
                    <td>
                      <button onClick={() => updateArchivedStatus(project)}>
                        {project.archived ? "Unarchived" : "Archived"}
                      </button>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
          <div className="page_number">
              <span>
                {pageNumberInfo(currentPage, totalPages)}
              </span>
              <div>
              {currentPage !==1 && (
                <button className="button_prev" onClick={handlePrevClick}>
                  {textInfo.prev}
                </button>
              )}
              {currentPage !==totalPages && (
                <button className="button_next" onClick={handleNextClick}>
                  {textInfo.next}
                </button>
              )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
